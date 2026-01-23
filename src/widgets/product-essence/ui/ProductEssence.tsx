export default function ProductEssence() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 border-t border-text-main/10">
      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg group order-2 lg:order-1">
        <div
          className="w-full h-full bg-center bg-cover transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBAIAjD-3AveX9EO7WQOKb3ESxt6_8wSop6SFAxuHLTvBchAKFRObsoHgQKdQKBLZ9qpFXC_Toi-kHPXwLO1Q-E3nM5FkH6C3SbQOgyufUvpBIFftkqx1_0PntQdunvia4emHmytXCSYHkhSbP7ZuNe2q66NWeSd8pohl6ZNKs5Ced1VbwyTXqtRsmEqh4iSIAMaBTNPOTqL5Y2o9jED-TdLI042y3ma0zbU2tkvvNJCsLdBkbafa4tKvOIIkkT6rm0zf5c8ug4oLgg')",
          }}
        ></div>
      </div>
      <div className="flex flex-col gap-6 order-1 lg:order-2">
        <h2 className="text-3xl md:text-4xl font-bold text-text-main leading-tight">
          The Essence of Claw and Soul
        </h2>
        <div className="flex flex-col gap-4 text-text-main/80 text-lg leading-relaxed font-body">
          <p>
            Our specialized AI doesn't just copy pixels; it deeply understands
            the bond you share. By analyzing the subtle glint in your pet's eyes
            and the texture of their fur, our proprietary algorithm reimagines
            your photo as a soulful work of art, preserving the spirit that
            makes them unique.
          </p>
        </div>
      </div>
    </div>
  );
}
