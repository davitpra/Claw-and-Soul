import Image from "next/image";
import Link from "next/link";
import { Container } from "@/shared/ui/Container";

export default function AIProcess() {
  return (
    <section className=" w-full py-20 bg-cream">
      <Container className="relative">
        {/* ── Header ── */}
        <div className="mb-14 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#448da6] mb-5">
            AI Art Preview
          </span>
          <h2 className="text-4xl font-black text-[#103642] md:text-5xl leading-[1.1] tracking-tight">
            See the Transformation
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-base text-[#103642]/55 leading-relaxed">
            Watch your pet become a Renaissance masterpiece in seconds.
            <br />
            Try it free before you buy.
          </p>
        </div>

        {/* ── 3-Step Flow ── */}
        <div className="flex flex-col lg:flex-row items-stretch gap-0">
          {/* Step 1 — Choose Style */}
          <div className="relative flex-1">
            <StepBadge number="01" variant="light" />
            <div className="flex flex-col items-center gap-5 rounded-3xl border border-slate-100 bg-white p-8 h-full min-h-[320px] shadow-sm">
              <div className="flex-1 flex items-center justify-center">
                <Image
                  src="/process/2 approve.png"
                  alt="Choose Style Illustration"
                  width={150}
                  height={110}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-[#103642] tracking-tight">
                  Choose Your Style
                </p>
                <p className="mt-2 text-sm text-[#103642]/50 leading-relaxed max-w-[200px] mx-auto">
                  Pick an art style for your pet and let our AI work its magic.
                </p>
              </div>
            </div>
          </div>
          {/* Arrow Connector 1 */}
          <DottedArrow />
          {/* Step 2 — Upload */}
          <div className="relative flex-1">
            <StepBadge number="02" variant="light" />
            <div className="flex flex-col items-center gap-5 rounded-3xl border-2 border-slate-200 bg-white p-8 h-full min-h-80">
              {/* Dog illustration */}
              <div className="flex-1 flex items-center justify-center">
                <Image
                  src="/process/1. Upload Picture.png"
                  alt="Upload Illustration"
                  width={150}
                  height={110}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-[#103642] tracking-tight">
                  Upload Pet Photo
                </p>
                <p className="mt-2 text-sm text-[#103642]/50 leading-relaxed max-w-[200px] mx-auto">
                  Add a clear photo of your pet in JPG, PNG or WEBP format.
                </p>
              </div>
              <div className="flex gap-2">
                {["JPG", "PNG", "WEBP"].map((fmt) => (
                  <span
                    key={fmt}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-400 tracking-wider"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Arrow Connector 2 */}
          <DottedArrow />

          {/* Step 3 — Result */}
          <div className="relative flex-1">
            <StepBadge number="03" variant="light" />
            <div className="flex flex-col items-center gap-5 rounded-3xl border border-slate-100 bg-white p-8 h-full min-h-80 shadow-sm overflow-hidden">
              <div className="flex-1 flex items-center justify-center">
                <Image
                  src="/process/3. Final Art.png"
                  alt="Result Illustration"
                  width={150}
                  height={110}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-[#103642] tracking-tight">
                  Get Your Masterpiece
                </p>
                <p className="mt-2 text-sm text-[#103642]/50 leading-relaxed max-w-[200px] mx-auto">
                  Preview your masterpiece in seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ── Sub-components ── */

function StepBadge({
  number,
  variant = "dark",
  side = "left",
}: {
  number: string;
  variant?: "dark" | "light";
  side?: "left" | "right";
}) {
  const base =
    "absolute -top-3.5 z-10 flex size-8 items-center justify-center rounded-full text-[11px] font-black tracking-wider shadow-md";
  const color =
    variant === "dark"
      ? "bg-[#103642] text-white"
      : "bg-white border-2 border-[#448da6]/30 text-[#448da6]";
  const pos = side === "right" ? "right-5" : "left-5";

  return <div className={`${base} ${color} ${pos}`}>{number}</div>;
}

function DottedArrow() {
  return (
    <div className="flex items-center justify-center py-6 lg:py-0 lg:px-2 shrink-0">
      <div className="flex items-center gap-0.5 rotate-90 lg:rotate-0">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="size-1 rounded-full bg-slate-300"
            style={{ opacity: 0.4 + i * 0.12 }}
          />
        ))}
        <div className="ml-0.5 text-slate-400">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 5h8M5.5 1.5L9 5l-3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
