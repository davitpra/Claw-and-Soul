import Link from "next/link";

export default function Hero() {
  return (
    <section className="w-full bg-cream py-12 md:py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            <div className="flex flex-col gap-4">
              <span className="text-primary font-bold tracking-wider uppercase text-sm">
                Personalized Pet Art
              </span>
              <h1 className="text-slate-dark text-4xl font-black leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
                Capture Their Soul in Art
              </h1>
              <p className="text-slate-dark/80 text-lg font-normal leading-relaxed max-w-md">
                Turn your favorite photo into a personalized keepsake that
                celebrates the unique bond with your furry friend.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/shop"
                className="flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:scale-105 hover:bg-primary-dark"
              >
                See our Products
              </Link>
              <Link
                href="/gallery"
                className="flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-bold text-slate-dark border border-slate-dark/10 transition-colors hover:bg-slate-50"
              >
                View Gallery
              </Link>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuD6DgqXswmvwDWNDv1q2X7m7lAnB34Z1hb2f9ISZJO8IQr2GyPfrff5dyLR4UyCo8jM9sOgRUVjreHp_91Zc233yM9MSdg1SLkSEWt5eJffB4Ns5dPj2IxcVZoA8jdN82nqKgc__ag8xMOiHult_2ciiQqIGnrlVmmdk1PbSfAmK4UhCZBQxfo532cbUb96JNWqcFmnxHRnFHueGM0rNM4ZJeY7dq5IxF3Cnny0SkiCZ-tSrKFrgg9jfAo8UB1m8OZ_hb5CknVIQYsg",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuBTWHCYfQET_qj7P9AVFTmaEHpDfPp6QWspagVxJqDGw1FvprnYi37nZK-k8RLcJrtSo3KjwPPixPCnphXLpKl-ERDXfD-yekwstIrNwNyo0jxMbpO6taPmWSZoVHAr6tshCVuh1UiSA1F-gFG9T07CW3a49NGIuhj3DF9jYypG0AqiYOpjqA-ThkFYGVES2YD9WIl47vV6qYQ7tLWFd9iZKwDlk_pc9v6lSsm5JqoMn_aTNK98X4V1RjmXjy4Vlb98DOu7dmQka7TK",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDxwdrz9AP1t68eOQ76ZYjIe-hXC0i7BP_vLztVyDF4H8oGHZoZasluOpA0W-J777f3eebeCdYQzvnwMYeA9-d8KWudRdMWLxVpT7oTzbjXFR7cs-FYfriYx0PH6uXZdSbXxN1RVVL-ovqH2INyB75O9kpWj3N1GYgb1XNCXJpjR_uX5WfhsxBOKFC-yRl3qNKCU0k4OmH1LZejG7cTzfLHeb4WGsJ0Q5h5hTGWz94jKbXpFnl5IiEYT4kTFMVS9jwyGlVTTUyVvSW1",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="size-10 rounded-full border-2 border-cream bg-gray-200 bg-cover bg-center"
                    style={{ backgroundImage: `url('${src}')` }}
                  ></div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex text-yellow-500 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[16px] fill-current"
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-dark/70">
                  Loved by 10,000+ pet parents
                </span>
              </div>
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="aspect-square w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAkZr3BM3Rl_X88fvH5jSsAls2yTmqNxMtDvrcAFJkkmYePk10Chpwztanb0UhGGjFcGQd0l8oPjNvjPVMnnUxRhAvOzn57_Q_K0FVLd5BAo3n2OfcjNdJh3kLF4T8zlc-2LLBUqTE_dEt0oH5Ej_FLVf0UzX-5gM3_CPDfgVaafrYmfy5V7jqB1M_k84o3wrv42DRh5CEdtdab7bPWqlwJ1PO6-vLuthrh9qJFU6ZXa2ufJwvVseHXqiRJklzKglG1zUFf7IEda1kJ')",
                }}
              ></div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden lg:block">
              <div className="rounded-xl bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center rounded-full bg-green-100 p-2 text-green-600">
                    <span className="material-symbols-outlined text-[20px]">
                      check_circle
                    </span>
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-dark">
                      Preview Ready
                    </p>
                    <p className="text-xs text-slate-dark/60">See it now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
