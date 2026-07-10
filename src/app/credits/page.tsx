import type { Metadata } from "next";
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { CreditPackCard } from "@/features/credit-pack-purchase/CreditPackCard";

export const metadata: Metadata = {
  title: "Buy Generation Credits — Claw & Soul",
  description:
    "Top up your generation credits to create more AI art of your pet.",
};

export default function CreditsPage() {
  return (
    <div className="bg-cream min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 md:px-10 lg:px-40 py-10 font-body">
        <div className="max-w-2xl mx-auto w-full">
          <header className="mb-8 text-center">
            <h1 className="font-display font-black text-3xl md:text-4xl text-text-main">
              Generation Credits
            </h1>
            <p className="mt-3 text-text-muted">
              Credits let you create AI art of your pet. Every account starts
              with a few free credits, and each purchase adds more. Pick a pack
              below to top up.
            </p>
          </header>

          <CreditPackCard />
        </div>
      </main>

      <Footer />
    </div>
  );
}
