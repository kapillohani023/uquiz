import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle, LegalSection } from "../LegalArticle";

export const metadata: Metadata = {
  title: "Privacy Policy — uquiz",
  description: "What uquiz collects, why, and the choices you have.",
};

export default function PrivacyPage() {
  return (
    <LegalArticle title="Privacy Policy" updated="July 19, 2026">
      <LegalSection heading="1. What we collect">
        <p>
          When you sign in with Google we receive your name and email address.
          As you use uquiz we store the content you create: your courses, the
          YouTube links you add (including titles and transcripts we fetch to
          generate quizzes), the quizzes generated for you, and your quiz
          attempts with their answers and scores.
        </p>
      </LegalSection>

      <LegalSection heading="2. How we use it">
        <p>
          We use this data solely to run the service: authenticating you,
          showing your courses and quizzes, generating quiz questions from the
          resources you enable, and tracking your scores over time. We do not
          sell your data or use it for advertising.
        </p>
      </LegalSection>

      <LegalSection heading="3. Sign-in with Google">
        <p>
          Authentication is handled by Google OAuth. We never see your Google
          password. Google&rsquo;s own privacy policy governs the data Google
          processes when you sign in.
        </p>
      </LegalSection>

      <LegalSection heading="4. Cookies">
        <p>
          We use cookies only to keep you signed in. We do not use advertising
          or cross-site tracking cookies.
        </p>
      </LegalSection>

      <LegalSection heading="5. Sharing">
        <p>
          Your courses, resources, and quiz results are private to your
          account. We share data only with the infrastructure providers that
          host the service (such as our database and hosting providers) and
          with services used to generate quiz content from your resources —
          and only as needed to operate uquiz.
        </p>
      </LegalSection>

      <LegalSection heading="6. Retention and deletion">
        <p>
          We keep your data while your account is active. Deleting a course
          deletes its resources, quizzes, and attempts. If you want your whole
          account and its data removed, contact us and we will delete it
          within 30 days.
        </p>
      </LegalSection>

      <LegalSection heading="7. Security">
        <p>
          Data is transmitted over encrypted connections and stored with
          access controls. No system is perfectly secure, but during the beta
          we follow standard industry practices to protect your data.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes to this policy">
        <p>
          We may update this policy as uquiz evolves. Material changes will be
          announced on this page with a new &ldquo;last updated&rdquo; date.
        </p>
      </LegalSection>

      <LegalSection heading="9. Contact">
        <p>
          Questions or deletion requests: support@uquiz.app. You can also read
          our{" "}
          <Link href="/terms" className="text-uq-primary hover:text-uq-link-hover">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalArticle>
  );
}
