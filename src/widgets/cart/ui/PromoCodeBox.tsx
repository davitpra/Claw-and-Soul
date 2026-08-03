// Placeholder visual: los códigos promocionales se aplican en el checkout de
// Shopify, así que este formulario todavía no está conectado a nada.
export default function PromoCodeBox() {
  return (
    <div className="bg-cream rounded-xl p-6 border border-slate-dark/5">
      <p className="text-sm font-bold text-slate-dark mb-3">
        Have a promo code?
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter code"
          className="flex-1 rounded-xl border border-slate-dark/10 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-dark/20"
        />
        <button className="bg-slate-dark text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors">
          Apply
        </button>
      </div>
    </div>
  );
}
