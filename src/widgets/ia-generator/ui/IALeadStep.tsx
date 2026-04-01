interface IALeadStepProps {
  onComplete: () => void;
}

export function IALeadStep({ onComplete }: IALeadStepProps) {
  return (
    <main className="flex-grow flex items-center justify-center px-4 py-8 md:py-12 animate-in fade-in zoom-in-95 duration-700">
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[#E5E0D8]">
          <div className="relative w-full md:w-5/12 h-64 md:h-auto bg-gray-200 overflow-hidden">
            <img
              alt="Blurred art preview"
              className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-90 transition-all duration-1000"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqruKWQZ48vypKc2KDwNU-A7eEWdee-4qr7voxSvahEirYjZJ3QmSQMZSa4GHMtmnjI5eTkQfmrY_hd3Sp46B3xITbeVqTwp4XU1EloL1v5pcuDA9l4RURurJdjzNpvBGAgPEgHl3KN1meLDAZgCl8cz3N49OEkrBHw17RvTAg9yq42QveTPszKqVLTB4gpTuwYnGVVDvh1_ky8ntzJ1OfwAYwrovrGYI0CPR268a3bUtfLR0K6QW4WMTsFYnGXXL-L6NlHeSXeR44"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-indigo-900/40 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
              <div className="bg-white/20 backdrop-blur-xl p-6 rounded-full border border-white/40 shadow-lg animate-pulse mb-4">
                <span className="material-symbols-outlined text-5xl drop-shadow-md">
                  auto_awesome
                </span>
              </div>
              <p className="font-bold text-lg drop-shadow-md tracking-wide">
                GENERATING...
              </p>
            </div>
          </div>
          <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-slate-dark mb-3 leading-tight tracking-tight font-display">
                Your Pet's Art is almost ready!
              </h1>
              <p className="text-slate-dark/80 text-lg leading-relaxed">
                Where should we send your high-resolution preview and exclusive
                discounts?
              </p>
            </div>
            <form className="space-y-5 font-body">
              <div className="space-y-1">
                <label className="sr-only" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  className="w-full px-5 py-3.5 rounded-lg border border-primary text-slate-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow bg-white text-base"
                  id="fullName"
                  placeholder="Your Name"
                  type="text"
                />
              </div>
              <div className="space-y-1">
                <label className="sr-only" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="w-full px-5 py-3.5 rounded-lg border border-primary text-slate-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow bg-white text-base"
                  id="email"
                  placeholder="your@email.com"
                  type="email"
                />
              </div>
              <div className="space-y-1">
                <label className="sr-only" htmlFor="petName">
                  Pet's Name
                </label>
                <div className="relative">
                  <input
                    className="w-full px-5 py-3.5 rounded-lg border border-primary text-slate-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow bg-white text-base"
                    id="petName"
                    placeholder="Your furry friend's name"
                    type="text"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-dark/50 font-medium bg-white pl-2">
                    Optional
                  </span>
                </div>
              </div>
              <button
                onClick={onComplete}
                className="group w-full bg-primary hover:bg-primary-dark text-white font-bold text-lg py-4 rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2"
                type="button"
              >
                Reveal My Masterpiece
                <span className="material-symbols-outlined text-xl group-hover:animate-bounce">
                  arrow_downward
                </span>
              </button>
              <p className="text-xs text-center text-slate-dark leading-relaxed mt-4 px-4 font-medium italic opacity-70">
                By clicking, you agree to receive art updates and special offers
                from Claw and Soul.
              </p>
            </form>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-6 text-slate-dark/40 grayscale opacity-60">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">lock</span>
            <span className="text-xs font-semibold">Secure SSL</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">
              verified_user
            </span>
            <span className="text-xs font-semibold">Privacy Protected</span>
          </div>
        </div>
      </div>
    </main>
  );
}
