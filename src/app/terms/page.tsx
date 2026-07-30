// TODO (legal): base genérica, no asesoría legal. Debe revisarlo un profesional
// antes de producción — en particular la licencia sobre las fotos subidas, la
// propiedad del arte generado y las limitaciones de responsabilidad.
import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/widgets/legal-page";
import { BRAND } from "@/shared/config/navigation";

export const metadata: Metadata = {
  title: "Terms of Service · Claw & Soul",
  description:
    "The terms that govern your use of Claw & Soul — accounts, credits, uploaded photos, generated artwork and orders.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="These terms cover your use of Claw & Soul: the Studio, the AI generator, credits and anything you order from us."
      lastUpdated="July 30, 2026"
    >
      <section>
        <h2>Your account</h2>
        <p>
          You need an account to save pets, artwork and orders. Keep your
          password to yourself — you are responsible for what happens under your
          account. Tell us right away if you think someone else has access to
          it.
        </p>
      </section>

      <section>
        <h2>Photos you upload</h2>
        <p>
          You must own the photos you upload, or have permission to use them.
          Don&apos;t upload anything illegal, offensive, or that infringes
          someone else&apos;s rights. You keep ownership of your photos; you
          give us permission to process them so we can generate your artwork and
          fulfil your order.
        </p>
      </section>

      <section>
        <h2>Artwork we generate</h2>
        <p>
          The portraits and paint-by-numbers templates created from your photo
          are yours to keep, print and paint for personal use. Reselling or
          redistributing them commercially requires our written permission.
        </p>
        <p>
          AI generation is not exact. Results vary between styles and photos,
          and a generation that completes is considered delivered even if you
          would have preferred a different result.
        </p>
      </section>

      <section>
        <h2>Credits</h2>
        <p>
          Credits pay for AI generations. They are consumed when a generation
          runs, have no cash value, and are not transferable between accounts.
          If a generation fails because of a problem on our side, contact us and
          we will restore the credits.
        </p>
      </section>

      <section>
        <h2>Orders and payment</h2>
        <p>
          Checkout is handled by Shopify. Prices, taxes and shipping are shown
          before you pay. See our{" "}
          <Link
            className="text-primary underline hover:text-primary-dark transition-colors"
            href="/shipping-returns"
          >
            Shipping &amp; Returns
          </Link>{" "}
          page for delivery times and the return policy on custom items.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>
          Don&apos;t try to break, overload or reverse-engineer the service,
          scrape it automatically, or use it to create content that harms
          others. We may suspend accounts that do.
        </p>
      </section>

      <section>
        <h2>Availability</h2>
        <p>
          We work to keep Claw & Soul running, but we can&apos;t promise it will
          always be available or free of errors. Features may change or be
          retired as the product evolves.
        </p>
      </section>

      <section>
        <h2>Liability</h2>
        <p>
          To the extent permitted by law, our liability for any claim relating
          to the service is limited to the amount you paid us for the order or
          credits the claim relates to.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update these terms. The date at the top of this page shows the
          latest version, and continuing to use the service means you accept it.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms? Email{" "}
          <a
            className="text-primary underline hover:text-primary-dark transition-colors"
            href={`mailto:${BRAND.email}`}
          >
            {BRAND.email}
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
