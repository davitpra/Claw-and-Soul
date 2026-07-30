// TODO (contenido): los plazos de producción y envío, los costes y la ventana de
// devolución están deliberadamente sin cifras — hay que rellenarlos con los
// datos reales de la operación antes de producción. No inventar números aquí:
// esta página es una promesa al cliente.
import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/widgets/legal-page";
import { BRAND } from "@/shared/config/navigation";

export const metadata: Metadata = {
  title: "Shipping & Returns · Claw & Soul",
  description:
    "How Claw & Soul orders are made, packed and delivered — and what happens if something arrives wrong.",
};

export default function ShippingReturnsPage() {
  return (
    <LegalPage
      title="Shipping & Returns"
      intro="Every piece is made to order from your pet's photo. Here's what to expect between checkout and the moment it reaches your door."
      lastUpdated="July 30, 2026"
    >
      <section>
        <h2>Digital downloads</h2>
        <p>
          Paint-by-numbers PDFs and digital artwork are delivered in your
          account — no shipping involved. You can download them again any time
          from your artwork and PBN pages.
        </p>
      </section>

      <section>
        <h2>Made to order</h2>
        <p>
          Canvases, posters and paint kits are produced individually after you
          order: your artwork is prepared, printed and checked before it ships.
          That production step happens before the delivery estimate at checkout
          starts counting.
        </p>
      </section>

      <section>
        <h2>Tracking your order</h2>
        <p>
          You can follow the status of every order from{" "}
          <Link
            className="text-primary underline hover:text-primary-dark transition-colors"
            href="/user/orders"
          >
            your orders page
          </Link>
          . We email you when it ships.
        </p>
      </section>

      <section>
        <h2>Damaged or incorrect items</h2>
        <p>
          If your order arrives damaged, or what you received doesn&apos;t match
          what you ordered, email us a photo of the item and packaging and
          we&apos;ll replace it at no cost.
        </p>
      </section>

      <section>
        <h2>Returns on custom work</h2>
        <p>
          Because each piece is made from your own photo, it can&apos;t be
          resold, so we can&apos;t accept returns simply because you changed
          your mind. If you&apos;re unhappy with how your artwork turned out,
          talk to us before ordering a physical version — you can preview the
          result in the Studio first, and we&apos;ll help you get it right.
        </p>
      </section>

      <section>
        <h2>Cancelling an order</h2>
        <p>
          We can cancel an order as long as production hasn&apos;t started.
          Contact us as soon as possible and we&apos;ll check.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Anything about a delivery or a return: email{" "}
          <a
            className="text-primary underline hover:text-primary-dark transition-colors"
            href={`mailto:${BRAND.email}`}
          >
            {BRAND.email}
          </a>{" "}
          or use the{" "}
          <Link
            className="text-primary underline hover:text-primary-dark transition-colors"
            href="/contact"
          >
            contact form
          </Link>
          .
        </p>
      </section>
    </LegalPage>
  );
}
