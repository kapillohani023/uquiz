import { z } from "zod";

/**
 * One multiple-choice question: exactly 4 options, with `answerIndex`
 * pointing at the correct one.
 */
export const questionSchema = z.object({
  question: z.string(),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  // A bounded int rather than a literal union: Gemini's `responseSchema`
  // conversion mis-tags a numeric-literal union as `enum` of `TYPE_STRING`,
  // which the API then rejects outright (400 "Invalid value ... TYPE_STRING").
  answerIndex: z.number().int().min(0).max(3),
});

export type Question = z.infer<typeof questionSchema>;

/** The shape a question-generation agent is asked to respond with. */
export const questionsResponseSchema = z.object({
  questions: z.array(questionSchema),
});

export type QuestionsResponse = z.infer<typeof questionsResponseSchema>;

/**
 * JSON-schema form of `questionsResponseSchema`, shaped for Gemini's
 * `responseSchema` (an OpenAPI-3.0-like subset of JSON Schema, not full JSON
 * Schema — no `$schema`, no `additionalProperties`).
 *
 * Not actually wired into the question-generation agent: `@google/adk`'s
 * `LlmAgent.outputSchema` accepts a Zod v4 object schema directly and
 * converts it internally (see `@google/adk`'s `utils/simple_zod_to_json.ts`,
 * which performs the same `zod/v4` `toJSONSchema(..., { target:
 * "openapi-3.0", io: "input" })` conversion done here), so
 * `questionAgent.ts` passes the Zod schema straight through instead of
 * duplicating that conversion. This export exists per spec / for any
 * external consumer that needs the raw Gemini-shaped schema.
 *
 * Uses zod's own built-in `toJSONSchema` (not the `zod-to-json-schema`
 * package) because that package's published types target Zod v3 and are
 * incompatible with the Zod v4 schemas here — the same reason ADK's
 * internal converter branches on Zod version and uses `zod/v4`'s
 * `toJSONSchema` for v4 schemas.
 */
export const questionsResponseJsonSchema = (() => {
  const schema = z.toJSONSchema(questionsResponseSchema, {
    target: "openapi-3.0",
    io: "input",
  }) as Record<string, unknown>;
  delete schema.$schema;
  delete schema.additionalProperties;
  return schema;
})();
