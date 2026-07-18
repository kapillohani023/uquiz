import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle, LegalSection } from "../LegalArticle";

export const metadata: Metadata = {
  title: "Terms of Service — uquiz",
  description: "The terms that govern your use of uquiz.",
};

export default function TermsPage() {
  return (
    <LegalArticle title="Terms of Service" updated="July 19, 2026">
      <LegalSection heading="1. About uquiz">
        <p>
          uquiz lets you turn YouTube links into custom courses and generate
          quizzes from them. By creating an account or using the service, you
          agree to these terms. If you do not agree, please do not use uquiz.
        </p>
      </LegalSection>

      <LegalSection heading="2. Your account">
        <p>
          You sign in with your Google account. You are responsible for
          activity that happens under your account and for keeping access to
          your Google account secure. You must be at least 13 years old (or
          the age of digital consent in your country) to use uquiz.
        </p>
      </LegalSection>

      <LegalSection heading="3. Your content">
        <p>
          Courses you create, links you add, and quiz attempts you make remain
          yours. You grant us the limited rights needed to store and process
          them so the service can work — for example, analyzing a video&rsquo;s
          transcript to generate quiz questions. Only add links you have the
          right to use, and don&rsquo;t use uquiz to infringe anyone&rsquo;s
          intellectual property.
        </p>
      </LegalSection>

      <LegalSection heading="4. Acceptable use">
        <p>
          Don&rsquo;t misuse the service: no attempts to break, overload, or
          probe it; no scraping other users&rsquo; data; no uploading unlawful
          content; and no reselling the service without our permission.
        </p>
      </LegalSection>

      <LegalSection heading="5. Generated content">
        <p>
          Quiz questions are generated automatically from the resources you
          provide and may contain mistakes. They are a study aid, not
          professional advice — verify anything important against the original
          material.
        </p>
      </LegalSection>

      <LegalSection heading="6. Beta service">
        <p>
          uquiz is free while in beta and provided &ldquo;as is&rdquo;, without
          warranties of any kind. Features may change, break, or be removed,
          and data may be reset while we are in beta. To the fullest extent
          permitted by law, our liability for any claim related to the service
          is limited to the amount you paid us in the past 12 months — which,
          during the free beta, is zero.
        </p>
      </LegalSection>

      <LegalSection heading="7. Termination">
        <p>
          You can stop using uquiz at any time. We may suspend or terminate
          accounts that violate these terms. On termination we may delete your
          content after a reasonable period.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes to these terms">
        <p>
          We may update these terms as the service evolves. If a change is
          material we will make reasonable efforts to notify you, for example
          on this page or by email. Continuing to use uquiz after a change
          takes effect means you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection heading="9. Contact">
        <p>
          Questions about these terms? See our{" "}
          <Link href="/privacy" className="text-uq-primary hover:text-uq-primary-hover">
            Privacy Policy
          </Link>{" "}
          or contact us at support@uquiz.app.
        </p>
      </LegalSection>
    </LegalArticle>
  );
}
