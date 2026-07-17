import { PrismaClient, Prisma, type Quiz } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Data-access layer. Every function that reads or mutates user data takes the
 * owning userId and scopes the query through the Course → User relation, so a
 * row belonging to another user behaves exactly like a missing row.
 */

/** Attempt answers: mcqId → selected option index. */
export type AttemptAnswers = Record<string, number>;

export class NotFoundError extends Error {
  constructor(entity: string) {
    super(`${entity} not found`);
    this.name = "NotFoundError";
  }
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function ensureUser(email: string, name: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name },
  });
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

/** Latest submitted score of a quiz, or null if never taken. */
function latestScore(quiz: { attempts: { score: number }[] }): number | null {
  return quiz.attempts[0]?.score ?? null;
}

/** Course list for the home screen: counts plus average of taken-quiz scores. */
export async function listCourses(userId: string) {
  const courses = await prisma.course.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { resources: true, quizzes: true } },
      quizzes: {
        select: {
          attempts: {
            where: { submittedAt: { not: null } },
            orderBy: { submittedAt: "desc" },
            take: 1,
            select: { score: true },
          },
        },
      },
    },
  });

  return courses.map(({ quizzes, _count, ...course }) => {
    const scores = quizzes
      .map(latestScore)
      .filter((s): s is number => s !== null);
    return {
      ...course,
      resourceCount: _count.resources,
      quizCount: _count.quizzes,
      avgScore: scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null,
    };
  });
}

/** Course detail: resources plus quiz count, or null if not owned. */
export function getCourse(userId: string, courseId: string) {
  return prisma.course.findFirst({
    where: { id: courseId, userId },
    include: {
      resources: { orderBy: { createdAt: "asc" } },
      _count: { select: { quizzes: true } },
    },
  });
}

export function createCourse(userId: string, name: string) {
  return prisma.course.create({ data: { userId, name } });
}

export async function renameCourse(userId: string, courseId: string, name: string) {
  const { count } = await prisma.course.updateMany({
    where: { id: courseId, userId },
    data: { name },
  });
  if (count === 0) throw new NotFoundError("Course");
}

export async function deleteCourse(userId: string, courseId: string) {
  const { count } = await prisma.course.deleteMany({
    where: { id: courseId, userId },
  });
  if (count === 0) throw new NotFoundError("Course");
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export async function addResource(
  userId: string,
  courseId: string,
  data: { title: string; url: string },
) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, userId },
    select: { id: true },
  });
  if (!course) throw new NotFoundError("Course");
  return prisma.resource.create({ data: { ...data, courseId } });
}

export async function setResourceEnabled(
  userId: string,
  resourceId: string,
  isEnabled: boolean,
) {
  const { count } = await prisma.resource.updateMany({
    where: { id: resourceId, course: { userId } },
    data: { isEnabled },
  });
  if (count === 0) throw new NotFoundError("Resource");
}

export async function deleteResource(userId: string, resourceId: string) {
  const { count } = await prisma.resource.deleteMany({
    where: { id: resourceId, course: { userId } },
  });
  if (count === 0) throw new NotFoundError("Resource");
}

/** Store a fetched transcript and mark the resource READY. */
export function markResourceReady(
  resourceId: string,
  transcript: string,
  meta?: Prisma.InputJsonValue,
) {
  return prisma.resource.update({
    where: { id: resourceId },
    data: { transcript, meta, status: "READY" },
  });
}

export function markResourceFailed(resourceId: string) {
  return prisma.resource.update({
    where: { id: resourceId },
    data: { status: "FAILED" },
  });
}

/** Enabled, transcript-ready resources — the input to quiz generation. */
export function getGenerationSources(userId: string, courseId: string) {
  return prisma.resource.findMany({
    where: { courseId, course: { userId }, isEnabled: true, status: "READY" },
    orderBy: { createdAt: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Quizzes
// ---------------------------------------------------------------------------

/**
 * Create a quiz shell in GENERATING state with an auto-numbered name
 * ("<Course> Quiz #n"). Questions are attached by finalizeQuiz.
 */
export async function createQuiz(
  userId: string,
  courseId: string,
  settings: { difficulty: number; durationMin: number },
) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, userId },
    select: { name: true, _count: { select: { quizzes: true } } },
  });
  if (!course) throw new NotFoundError("Course");
  return prisma.quiz.create({
    data: {
      ...settings,
      courseId,
      name: `${course.name} Quiz #${course._count.quizzes + 1}`,
    },
  });
}

export type GeneratedQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
};

/** Attach generated questions and flip the quiz to READY, atomically. */
export function finalizeQuiz(quizId: string, questions: GeneratedQuestion[]) {
  return prisma.$transaction([
    prisma.mcq.createMany({
      data: questions.map((q, order) => ({ ...q, order, quizId })),
    }),
    prisma.quiz.update({ where: { id: quizId }, data: { status: "READY" } }),
  ]);
}

export function markQuizFailed(quizId: string) {
  return prisma.quiz.update({
    where: { id: quizId },
    data: { status: "FAILED" },
  });
}

export type QuizListItem = Quiz & {
  courseName: string;
  questionCount: number;
  latestScore: number | null;
};

/** Quiz list rows, newest first; scoped to one course when courseId is given. */
export async function listQuizzes(
  userId: string,
  courseId?: string,
): Promise<QuizListItem[]> {
  const quizzes = await prisma.quiz.findMany({
    where: { course: { userId }, courseId, isArchived: false },
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { name: true } },
      _count: { select: { mcqs: true } },
      attempts: {
        where: { submittedAt: { not: null } },
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: { score: true },
      },
    },
  });

  return quizzes.map(({ course, _count, attempts, ...quiz }) => ({
    ...quiz,
    courseName: course.name,
    questionCount: _count.mcqs,
    latestScore: attempts[0]?.score ?? null,
  }));
}

/**
 * Quiz with ordered questions, or null if not owned. Includes answerIndex —
 * strip it before sending questions to the client for an unsubmitted attempt.
 */
export function getQuiz(userId: string, quizId: string) {
  return prisma.quiz.findFirst({
    where: { id: quizId, course: { userId } },
    include: { mcqs: { orderBy: { order: "asc" } } },
  });
}

export async function setQuizArchived(
  userId: string,
  quizId: string,
  isArchived: boolean,
) {
  const { count } = await prisma.quiz.updateMany({
    where: { id: quizId, course: { userId } },
    data: { isArchived },
  });
  if (count === 0) throw new NotFoundError("Quiz");
}

export async function deleteQuiz(userId: string, quizId: string) {
  const { count } = await prisma.quiz.deleteMany({
    where: { id: quizId, course: { userId } },
  });
  if (count === 0) throw new NotFoundError("Quiz");
}

// ---------------------------------------------------------------------------
// Attempts
// ---------------------------------------------------------------------------

/** Open an attempt row so the timer and progress survive a refresh. */
export async function startAttempt(userId: string, quizId: string) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, course: { userId }, status: "READY" },
    select: { id: true },
  });
  if (!quiz) throw new NotFoundError("Quiz");
  return prisma.quizAttempt.create({
    data: { quizId, answers: {}, score: 0 },
  });
}

/**
 * Grade and close an attempt. Returns the score plus per-question results
 * for the review screen. Idempotence: an already-submitted attempt is not
 * regraded.
 */
export async function submitAttempt(
  userId: string,
  attemptId: string,
  answers: AttemptAnswers,
) {
  const attempt = await prisma.quizAttempt.findFirst({
    where: { id: attemptId, quiz: { course: { userId } } },
    include: { quiz: { include: { mcqs: { orderBy: { order: "asc" } } } } },
  });
  if (!attempt) throw new NotFoundError("Attempt");
  if (attempt.submittedAt) return getAttemptResult(userId, attemptId);

  const mcqs = attempt.quiz.mcqs;
  const correct = mcqs.filter((m) => answers[m.id] === m.answerIndex).length;
  const score = mcqs.length ? Math.round((100 * correct) / mcqs.length) : 0;

  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: { answers, score, submittedAt: new Date() },
  });
  return buildResult(attempt.quiz.name, score, mcqs, answers);
}

/** Result of a submitted attempt, or null if not owned / not submitted. */
export async function getAttemptResult(userId: string, attemptId: string) {
  const attempt = await prisma.quizAttempt.findFirst({
    where: {
      id: attemptId,
      submittedAt: { not: null },
      quiz: { course: { userId } },
    },
    include: { quiz: { include: { mcqs: { orderBy: { order: "asc" } } } } },
  });
  if (!attempt) return null;
  return buildResult(
    attempt.quiz.name,
    attempt.score,
    attempt.quiz.mcqs,
    attempt.answers as AttemptAnswers,
  );
}

function buildResult(
  quizName: string,
  score: number,
  mcqs: { id: string; question: string; options: string[]; answerIndex: number }[],
  answers: AttemptAnswers,
) {
  return {
    quizName,
    score,
    correctCount: mcqs.filter((m) => answers[m.id] === m.answerIndex).length,
    total: mcqs.length,
    questions: mcqs.map((m) => ({
      question: m.question,
      options: m.options,
      answerIndex: m.answerIndex,
      selectedIndex: answers[m.id] ?? null,
      correct: answers[m.id] === m.answerIndex,
    })),
  };
}
