import { auth } from "@/app/auth";
import { listCourses } from "@/lib/db";
import { CoursesView } from "@/components/CoursesView";

export default async function HomePage() {
  const session = await auth();
  const courses = await listCourses(session!.user!.id);

  return (
    <CoursesView
      courses={courses.map((c) => ({
        id: c.id,
        name: c.name,
        resourceCount: c.resourceCount,
        quizCount: c.quizCount,
        avgScore: c.avgScore,
      }))}
    />
  );
}
