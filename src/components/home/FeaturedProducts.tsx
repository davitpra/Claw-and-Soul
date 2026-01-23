import Link from "next/link";

interface ProductProps {
  products: any[];
  featuredCollection: any;
}

export default function FeaturedProducts({
  products,
  featuredCollection,
}: ProductProps) {
  return (
    <section className="py-20 bg-cream">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-dark md:text-4xl">
              {featuredCollection?.title || "Featured Collections"}
            </h2>
            <p className="mt-2 text-slate-dark/70">
              {featuredCollection?.description ||
                "Discover our most popular personalized products."}
            </p>
          </div>
          <Link
            className="flex items-center gap-1 text-primary font-bold hover:gap-2 transition-all"
            href="/shop"
          >
            View All Products
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((edge: any) => {
            const product = edge.node;
            const price = product.priceRange.minVariantPrice.amount;
            const img = product.images.edges[0]?.node.url || "/placeholder.jpg";

            return (
              <div key={product.id} className="group flex flex-col gap-4">
                <Link
                  href={`/product/${product.handle}`}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div
                    className="aspect-[4/5] w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${img}')` }}
                  ></div>
                </Link>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-dark line-clamp-1">
                      {product.title}
                    </h3>
                    <span className="text-base font-bold text-slate-dark">
                      From ${parseFloat(price).toFixed(0)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-dark/60 line-clamp-2">
                    {product.description}
                  </p>
                  <Link
                    href={`/product/${product.handle}`}
                    className="mt-auto w-full text-center rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-dark"
                  >
                    See Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
