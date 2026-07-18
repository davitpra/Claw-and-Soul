import Image from "next/image";
import { Container } from "@/shared/ui/Container";

export default function AIProcess() {
  return (
    <section className=" w-full py-20 bg-cream">
      <Container className="relative">
        {/* ── Header ── */}
        <div className="mb-14 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#448da6] mb-5">
            HOW TO USE
          </span>
          <h2 className="font-display text-4xl font-black text-slate-dark md:text-5xl leading-[1.1] tracking-tight">
            Get your custom pet portrait in 3 easy steps
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-base text-slate-dark/55 leading-relaxed">
            Watch your pet become a masterpiece in seconds.
            <br />
            Try it free before you buy.
          </p>
        </div>

        {/* ── 3-Step Flow ── */}
        <div className="flex flex-col lg:flex-row items-stretch gap-0">
          {/* Step 1 — Choose Style */}
          <div className="relative flex-1">
            <div className="flex flex-col items-center gap-5 h-full">
              <div className="flex-1 flex items-center justify-center bg-white rounded-full">
                <Image
                  src="/process/2 approve.png"
                  alt="Choose Style Illustration"
                  width={200}
                  height={150}
                />
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-dark tracking-tight">
                  1. Choose Your Style
                </p>
                <p className="mt-2 text-sm text-slate-dark/50 leading-relaxed max-w-50 mx-auto">
                  Pick an art style for your pet, select size and click
                  Personalize.
                </p>
              </div>
            </div>
          </div>
          {/* Arrow Connector 1 */}
          <DottedArrow />
          {/* Step 2 — Upload */}
          <div className="relative flex-1">
            <div className="flex flex-col items-center gap-5 h-full">
              {/* Dog illustration */}
              <div className="flex-1 flex items-center justify-center bg-white rounded-full">
                <Image
                  src="/process/1. Upload Picture.png"
                  alt="Upload Illustration"
                  width={200}
                  height={150}
                />
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-dark tracking-tight">
                  Upload Pet Photo
                </p>
                <p className="mt-2 text-sm text-slate-dark/50 leading-relaxed max-w-50 mx-auto">
                  Add a clear photo of your pet in JPG, PNG or WEBP format.
                </p>
              </div>
            </div>
          </div>
          {/* Arrow Connector 2 */}
          <DottedArrow />

          {/* Step 3 — Result */}
          <div className="relative flex-1">
            <div className="flex flex-col items-center gap-5 h-full">
              <div className="flex-1 flex items-center justify-center bg-white rounded-full">
                <Image
                  src="/process/3. Final Art.png"
                  alt="Result Illustration"
                  width={200}
                  height={150}
                />
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-dark tracking-tight">
                  Get Your Masterpiece
                </p>
                <p className="mt-2 text-sm text-slate-dark/50 leading-relaxed max-w-50 mx-auto">
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
