"use client";

import { Container } from "@/shared/ui/Container";
import { useRouter } from "next/navigation";

interface IAThanksStepProps {
  thanksUrl?: string | null;
}

export function IAThanksStep({ thanksUrl }: IAThanksStepProps) {
  const router = useRouter();

  return (
    <main className="grow flex flex-col bg-white">
      <section>
        {/* Left — image, half screen */}
        <Container>
          <div className="flex-1 flex flex-col md:flex-row animate-in fade-in duration-700">
            <div className="w-full md:w-1/2 bg-white flex items-center justify-center min-h-72 md:min-h-0">
              <div className="relative overflow-hidden bg-white w-full max-w-2xl aspect-3/4 max-h-screen">
                {thanksUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thanksUrl}
                    alt="Your personalized artwork"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-7xl text-primary/40">
                      pets
                    </span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-dark uppercase tracking-widest shadow-sm">
                  Made with love, just for you
                </div>
              </div>
            </div>

            {/* Right — text content, half screen */}
            <div className="w-full md:w-1/2 flex items-center justify-center px-10 py-14 bg-white">
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-5 max-w-sm w-full">
                <span className="material-symbols-outlined text-primary text-3xl">
                  favorite
                </span>

                <h1 className="font-display text-5xl md:text-6xl font-black text-slate-dark tracking-tight leading-none">
                  Thank you!
                </h1>

                <div className="flex items-center gap-3 w-full justify-center md:justify-start">
                  <div className="h-px flex-1 max-w-30 bg-[#E0DED9]" />
                </div>

                <p className="text-slate-dark/70 text-base leading-relaxed">
                  We&apos;re crafting your artwork right now. As soon as
                  it&apos;s ready, we&apos;ll send it to your email. You can
                  also find it in your profile.
                </p>

                <div className="flex flex-col items-center gap-3 mt-2 w-full">
                  <button
                    onClick={() => router.push("/user")}
                    className="w-full  flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-6 py-3 text-sm font-bold transition-all shadow-sm hover:shadow-md hover:scale-105"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      person
                    </span>
                    Go to Profile
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-white border border-[#E0DED9] text-slate-dark hover:bg-gray-50 px-6 py-3 text-sm font-bold transition-all shadow-sm hover:shadow-md"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      storefront
                    </span>
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
