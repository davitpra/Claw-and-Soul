import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { PaintByNumbers } from "@/widgets/paint-by-numbers";

export const metadata = {
  title: "Paint by Numbers · Claw & Soul",
  description:
    "Convierte cualquier foto en una plantilla para pintar por números, vectorizada en SVG.",
};

export default function PaintByNumbersPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-clip bg-background-light">
      <Navbar />
      <main className="flex-1">
        <PaintByNumbers />
      </main>
      <Footer />
    </div>
  );
}
