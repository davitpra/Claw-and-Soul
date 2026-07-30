// TODO (legal): este texto es una base genérica escrita a partir de lo que la
// app realmente hace (fotos de mascotas, generación con IA, pedidos vía
// Shopify, descargas digitales). NO es asesoría legal: debe revisarlo un
// profesional antes de producción, sobre todo las secciones de retención de
// datos, terceros y derechos del usuario según la jurisdicción de la tienda.
import type { Metadata } from "next";
import { LegalPage } from "@/widgets/legal-page";
import { BRAND } from "@/shared/config/navigation";

export const metadata: Metadata = {
  title: "Privacy Policy · Claw & Soul",
  description:
    "How Claw & Soul collects, uses and protects your data — including the pet photos you upload and the artwork you generate.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains what we collect when you use Claw & Soul, why we collect it, and the control you have over it."
      lastUpdated="July 30, 2026"
    >
      <section>
        <h2>Information we collect</h2>
        <ul>
          <li>
            <strong>Account details</strong> — your name, email address and
            password when you create an account, or the basic profile Google
            shares with us if you sign in with Google.
          </li>
          <li>
            <strong>Photos and pet details</strong> — the images you upload to
            the Studio or the AI generator, plus any pet name or notes you save
            alongside them.
          </li>
          <li>
            <strong>Generated artwork</strong> — the portraits and
            paint-by-numbers templates created from your photos, stored so you
            can find them again in your account.
          </li>
          <li>
            <strong>Order information</strong> — what you bought, your shipping
            address and order status. Payments are processed by Shopify; we
            never see or store your full card details.
          </li>
          <li>
            <strong>Technical data</strong> — session information and basic
            usage data needed to keep you signed in and to keep the service
            running.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <p>
          We use your information to create the artwork you ask for, to keep it
          available in your account, to fulfil and support your orders, and to
          answer you when you contact us. We do not sell your personal data, and
          we do not use your photos for advertising.
        </p>
      </section>

      <section>
        <h2>Service providers</h2>
        <p>
          Some parts of the service run on third parties acting on our behalf:
          Shopify for the store and checkout, Cloudinary for image hosting, and
          the AI providers that generate your artwork. They only receive what
          they need to perform their function.
        </p>
      </section>

      <section>
        <h2>Keeping your data</h2>
        <p>
          Your photos, artwork and orders stay in your account until you delete
          them or ask us to close your account. Order records may be kept longer
          when accounting or tax rules require it.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can view and edit your details from your account profile, delete
          saved pets and artwork at any time, and ask us to delete your account
          entirely. Write to{" "}
          <a
            className="text-primary underline hover:text-primary-dark transition-colors"
            href={`mailto:${BRAND.email}`}
          >
            {BRAND.email}
          </a>{" "}
          and we will handle it.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          Sessions are held in httpOnly cookies so they are not readable by
          scripts in your browser, and access tokens are short-lived. No system
          is perfect, but we take reasonable measures to protect your account.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          Claw & Soul is not directed at children under 13, and we do not
          knowingly collect their personal information.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          If we make a meaningful change we will update the date at the top of
          this page. Continuing to use the service after a change means you
          accept the updated policy.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy? Email{" "}
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
