import Link from "next/link";

export default function AIPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="mb-14 text-center">
          <span className="text-primary-accent font-bold tracking-wider uppercase text-sm mb-2 block">
            AI Art Preview
          </span>
          <h2 className="text-3xl font-black text-slate-dark md:text-4xl">
            See the Transformation
          </h2>
          <p className="mt-4 text-slate-dark/70 max-w-2xl mx-auto">
            Watch your pet turn into a Renaissance masterpiece instantly.
            Experience the magic of our AI before you buy.
          </p>
        </div>
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_auto_1fr] gap-8 lg:gap-10 items-center">
            <div className="relative group cursor-pointer w-full mx-auto">
              <div className="aspect-[4/5] w-full rounded-2xl border-2 border-dashed border-slate-300 bg-cream/30 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-primary-accent hover:bg-cream/50">
                <div className="size-20 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[40px] text-slate-dark/50 group-hover:text-primary-accent transition-colors">
                    add_a_photo
                  </span>
                </div>
                <div className="text-center px-6">
                  <p className="font-bold text-slate-dark text-lg">
                    Upload Pet Photo
                  </p>
                  <p className="text-sm text-slate-dark/50 mt-1">
                    Drop image here or click to browse
                  </p>
                  <span className="inline-block mt-4 px-3 py-1 bg-white rounded text-xs font-semibold text-slate-dark border border-slate-200">
                    JPEG, PNG
                  </span>
                </div>
              </div>
              <div className="absolute -top-3 -left-3 bg-slate-dark text-white text-xs font-bold py-1 px-3 rounded-full shadow-md z-10">
                Step 1
              </div>
            </div>
            <div className="flex justify-center py-4 lg:py-0">
              <div className="flex flex-col items-center gap-2">
                <div className="size-16 rounded-full bg-primary-accent/10 flex items-center justify-center text-primary-accent animate-pulse">
                  <span className="material-symbols-outlined text-[32px] lg:rotate-0 rotate-90">
                    arrow_forward
                  </span>
                </div>
                <span className="text-xs font-bold text-primary-accent uppercase tracking-wide">
                  AI Magic
                </span>
              </div>
            </div>
            <div className="relative group w-full mx-auto">
              <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-100 relative border-4 border-white">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBHeNR2rBiKdgNqJwr9p0OB2CtgE-C6GIx1dYM7n_TTpzlxow9y264GudhdhqsHyQCLxu69xp1kp-kePGTpMYuzyjmGaEzfTF1EW-M1oRZqj9nTFANWeAg8wqlAmWGBjef-C94DFGU7w9vJcYXlspzMbNmizadTVywvaGc81P9fyiE83SlIbXDNnEgdr3re64DRkcABSIVf1-Nd2R_qxmS3jHTss-xP6ZRNe4SaelTXoYPDShPfWl45WT_N784p7ipNvFbXKAbs19U4')",
                  }}
                ></div>
                <div className="absolute inset-y-0 left-0 w-[50%] overflow-hidden bg-gray-100 border-r-2 border-white/50">
                  <div
                    className="absolute inset-0 w-[200%] bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQbcWgrNDM3FyFb8i7zwgk7zpIiZC9v_IdT686jK2gjEz1HEeJtJkhfogbxoTFT61q1haZY3r-5f4WwXx2ywyDbh---9f-_oKXraMb83m1LtXx-0I_H3y2F-AWxrHelCGsADa6Nj14SVkK3JSAJpAy6heyNe8j97Q8LNkjX14RwyHzwzzd_HZ1_oMGWygKs-kdNMrskiQYNDywy3X4vKJQVhALOVH8j9WrFFzzHR2d73_tqY7pWG4o22VbwE2ZnS0KgtUAkmQJkLlK')",
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-black/5"></div>
                </div>
                <div className="absolute inset-y-0 left-[50%] -translate-x-1/2 flex items-center justify-center pointer-events-none">
                  <div className="h-full w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)]"></div>
                  <div className="absolute size-10 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-accent ring-4 ring-black/10">
                    <span className="material-symbols-outlined text-sm font-bold">
                      code
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-sm text-white text-xs uppercase font-bold px-4 py-2 rounded-full tracking-wider">
                  Original
                </div>
                <div className="absolute bottom-6 right-6 bg-primary-accent/90 backdrop-blur-sm text-white text-xs uppercase font-bold px-4 py-2 rounded-full tracking-wider">
                  Masterpiece
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-primary-accent text-white text-xs font-bold py-1 px-3 rounded-full shadow-md z-10">
                Step 2
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 text-center">
          <button className="inline-flex items-center justify-center rounded-xl bg-[#448DA6] px-12 py-5 text-lg font-bold text-white shadow-xl shadow-[#448DA6]/20 transition-all hover:scale-105 hover:bg-[#367a8f] ring-offset-2 hover:ring-2 ring-[#448DA6]">
            Try the AI Generator Now
            <span className="material-symbols-outlined ml-2">auto_awesome</span>
          </button>
          <p className="mt-4 text-slate-dark/50 text-sm">
            Free preview • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
