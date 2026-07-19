import { notFound } from "next/navigation";
import { auth } from "@/app/auth";
import { getCourse } from "@/lib/db";
import { CourseView } from "./CourseView";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  const course = await getCourse(session!.user!.id, courseId);
  if (!course) notFound();

  return (
    <CourseView
      course={{ id: course.id, name: course.name }}
      quizCount={course._count.quizzes}
      resources={course.resources.map((r) => {
        const meta = r.meta as { thumbnailUrl?: string | null } | null;
        return {
          id: r.id,
          title: r.title,
          url: r.url,
          isEnabled: r.isEnabled,
          status: r.status,
          addedAt: r.createdAt.toISOString(),
          thumbnailUrl: meta?.thumbnailUrl ?? null,
        };
      })}
    />
  );
}
