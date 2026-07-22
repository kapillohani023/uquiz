import type { Resource } from "@prisma/client";
import type { Event } from "@google/adk";
import { InMemoryRunner, isFinalResponse, ParallelAgent, stringifyContent } from "@google/adk";
import type { Content } from "@google/genai";
import { DIFFICULTY_LABELS } from "@/lib/format";
import type { GeneratedQuestion } from "@/lib/db";
import { buildQuestionAgent } from "./questionAgent";
import { questionsResponseSchema } from "./schema";

// Matches the old OpenRouter-based implementation: one initial attempt plus
// one retry per resource.
const GENERATION_ATTEMPTS = 2;

const RUN_USER_ID = "quiz-generation";

const TRIGGER_MESSAGE: Content = {
  role: "user",
  parts: [{ text: "Generate the questions now, per your instructions." }],
};

type ResourcePlan = { resource: Resource; count: number };

/**
 * Spreads `questionCount` across `sources` as evenly as possible; the first
 * `questionCount % sources.length` sources (in the given order) get one
 * extra question. Resources that end up with a count of 0 are dropped.
 */
function distribute(sources: Resource[], questionCount: number): ResourcePlan[] {
  const base = Math.floor(questionCount / sources.length);
  const remainder = questionCount % sources.length;
  return sources
    .map((resource, i) => ({ resource, count: base + (i < remainder ? 1 : 0) }))
    .filter((plan) => plan.count > 0);
}

function tryParseQuestions(raw: string, expectedCount: number): GeneratedQuestion[] | null {
  try {
    const parsed = questionsResponseSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.warn("Question agent output failed schema validation:", parsed.error, raw);
      return null;
    }
    if (parsed.data.questions.length !== expectedCount) {
      console.warn(
        `Question agent returned ${parsed.data.questions.length} questions, expected ${expectedCount}`,
      );
      return null;
    }
    return parsed.data.questions;
  } catch (error) {
    console.warn("Question agent output was not valid JSON:", error, raw);
    return null;
  }
}

/**
 * Explains why a final-response event carried no usable text, using the
 * error/finish-reason fields the model provider set on it. `stringifyContent`
 * silently returns "" for these events, which otherwise shows up downstream
 * as an opaque "Unexpected end of JSON input".
 */
function describeEmptyResponse(event: Event): string {
  const parts: string[] = [];
  if (event.finishReason) parts.push(`finishReason=${event.finishReason}`);
  if (event.errorCode) parts.push(`errorCode=${event.errorCode}`);
  if (event.errorMessage) parts.push(`errorMessage=${event.errorMessage}`);
  return parts.length > 0 ? parts.join(", ") : "no content, no error/finish reason reported";
}

async function runSingleAgent(agent: ReturnType<typeof buildQuestionAgent>): Promise<string> {
  const runner = new InMemoryRunner({ agent });
  let text = "";
  for await (const event of runner.runEphemeral({ userId: RUN_USER_ID, newMessage: TRIGGER_MESSAGE })) {
    if (event.author === agent.name && isFinalResponse(event)) {
      text = stringifyContent(event);
      if (!text) {
        console.warn(`Question agent ${agent.name} returned no content: ${describeEmptyResponse(event)}`);
      } else if (event.finishReason && event.finishReason !== "STOP") {
        console.warn(`Question agent ${agent.name} finished with reason: ${event.finishReason}`);
      }
    }
  }
  return text;
}

/**
 * Generates a full quiz's questions: distributes `questionCount` across
 * `sources`, runs one question-writing agent per resource (in parallel),
 * validates each resource's output against the questions schema, retries
 * failures individually, and concatenates the results in resource order.
 */
export async function generateQuizQuestions(
  sources: Resource[],
  questionCount: number,
  difficulty: number,
): Promise<GeneratedQuestion[]> {
  if (sources.length === 0) {
    throw new Error("No ready sources to generate questions from");
  }

  const difficultyLabel = DIFFICULTY_LABELS[difficulty] ?? String(difficulty);
  const plans = distribute(sources, questionCount);
  if (plans.length === 0) {
    throw new Error("No resources allotted any questions");
  }

  const buildAgentFor = (plan: ResourcePlan) =>
    buildQuestionAgent({
      resourceId: plan.resource.id,
      title: plan.resource.title,
      transcript: plan.resource.transcript ?? "",
      count: plan.count,
      difficultyLabel,
      difficulty,
    });

  // Attempt 1: run one agent per resource, all in parallel.
  const agents = plans.map(buildAgentFor);
  const parallelAgent = new ParallelAgent({
    name: "question_generation_parallel",
    subAgents: agents,
  });
  const parallelRunner = new InMemoryRunner({ agent: parallelAgent });

  const outputByAgentName = new Map<string, string>();
  for await (const event of parallelRunner.runEphemeral({
    userId: RUN_USER_ID,
    newMessage: TRIGGER_MESSAGE,
  })) {
    if (event.author && isFinalResponse(event)) {
      const text = stringifyContent(event);
      if (!text) {
        console.warn(`Question agent ${event.author} returned no content: ${describeEmptyResponse(event)}`);
      } else if (event.finishReason && event.finishReason !== "STOP") {
        console.warn(`Question agent ${event.author} finished with reason: ${event.finishReason}`);
      }
      outputByAgentName.set(event.author, text);
    }
  }

  const results: (GeneratedQuestion[] | null)[] = plans.map((plan, i) => {
    const raw = outputByAgentName.get(agents[i].name);
    if (raw === undefined) {
      console.warn(`Question agent ${agents[i].name} produced no final-response event`);
      return null;
    }
    console.log(`Question agent ${agents[i].name} produced output:`, raw);
    return tryParseQuestions(raw, plan.count);
  });

  // Attempt 2: retry, one resource at a time, only for resources whose
  // parallel-run output didn't validate.
  await Promise.all(
    plans.map(async (plan, i) => {
      if (results[i]) return;

      const retryAgent = buildAgentFor(plan);
      const raw = await runSingleAgent(retryAgent);
      const parsed = tryParseQuestions(raw, plan.count);
      if (!parsed) {
        throw new Error(
          `Question generation failed for resource ${plan.resource.id} after ` +
            `${GENERATION_ATTEMPTS} attempts`,
        );
      }
      results[i] = parsed;
    }),
  );

  return (results as GeneratedQuestion[][]).flat();
}
