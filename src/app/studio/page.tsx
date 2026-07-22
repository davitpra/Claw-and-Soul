import { Suspense } from "react";
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { Studio } from "@/widgets/studio";

export const metadata = {
  title: "Studio · Claw & Soul",
  description:
    "Turn any photo into a paint-by-numbers template, vectorized as SVG.",
};

export default function StudioPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-background-light">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={null}>
          <Studio />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
