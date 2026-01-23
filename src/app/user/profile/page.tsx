export default function ProfilePage() {
  return (
    <>
      <div className="flex justify-between items-end px-4 pb-6">
        <h2 className="text-slate-dark tracking-tight text-[28px] font-bold leading-tight font-display">
          Personal Details
        </h2>
        <button className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow-sm hover:bg-primary-dark transition-all focus:ring-2 focus:ring-primary/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">
            edit_square
          </span>
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 pb-10">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-dark/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cream rounded-full">
              <span className="material-symbols-outlined text-slate-dark">
                badge
              </span>
            </div>
            <h3 className="text-slate-dark font-bold text-lg">
              Basic Information
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-slate-dark/50 text-xs font-bold uppercase tracking-widest mb-1">
                Full Name
              </p>
              <p className="text-slate-dark font-medium">Sarah Jenkins</p>
            </div>
            <div>
              <p className="text-slate-dark/50 text-xs font-bold uppercase tracking-widest mb-1">
                Email Address
              </p>
              <p className="text-slate-dark font-medium">sarah.j@example.com</p>
            </div>
            <div>
              <p className="text-slate-dark/50 text-xs font-bold uppercase tracking-widest mb-1">
                Phone Number
              </p>
              <p className="text-slate-dark font-medium">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-dark/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cream rounded-full">
              <span className="material-symbols-outlined text-slate-dark">
                local_shipping
              </span>
            </div>
            <h3 className="text-slate-dark font-bold text-lg">
              Shipping Address
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-slate-dark/50 text-xs font-bold uppercase tracking-widest mb-1">
                Primary Address
              </p>
              <p className="text-slate-dark font-medium">
                123 Willow Creek Lane
              </p>
              <p className="text-slate-dark font-medium">Apt 4B</p>
              <p className="text-slate-dark font-medium">Portland, OR 97205</p>
              <p className="text-slate-dark font-medium">United States</p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                Default
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-dark/5 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cream rounded-full">
              <span className="material-symbols-outlined text-slate-dark">
                credit_card
              </span>
            </div>
            <h3 className="text-slate-dark font-bold text-lg">
              Payment Methods
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border border-slate-dark/10 rounded-lg hover:bg-cream/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-8 w-12 bg-slate-dark/10 rounded flex items-center justify-center">
                  <span className="font-bold text-xs text-slate-dark/70">
                    VISA
                  </span>
                </div>
                <div>
                  <p className="text-slate-dark font-bold text-sm">
                    Visa ending in 4242
                  </p>
                  <p className="text-slate-dark/50 text-xs">Expires 12/25</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-dark/40">
                Default
              </span>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-dark/10 rounded-lg hover:bg-cream/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-8 w-12 bg-slate-dark/10 rounded flex items-center justify-center">
                  <span className="font-bold text-xs text-slate-dark/70">
                    MC
                  </span>
                </div>
                <div>
                  <p className="text-slate-dark font-bold text-sm">
                    Mastercard ending in 8899
                  </p>
                  <p className="text-slate-dark/50 text-xs">Expires 09/24</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
