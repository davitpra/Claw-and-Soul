import { Container } from "@/shared/ui/Container";

const REVIEWS = [
  {
    name: "Sarah M.",
    role: "Dog Mom",
    text: "I painted my Luna's portrait the month after we lost her. I cried, I smiled, and now she hangs in our living room where she belongs.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAlEqxrMbBlDw8MoQ3NO9mL8SFOoh4tCkiMv3CYhMmX79AQ2__ZZHq-1ilP2ITmmLOh_7O_xhM2N1hvxRbdW7vJqf5ony1_ZrPuC1NVgGdqLcCm74gQ5KTwC0FQcH5AfnXUIBKmwUlyFxQJSeb9oeOrBgYd35laAzIbEPvazaHuwRo3MiZlbDdCyzxz6cICyXQ4eFnO-J9IltfikGmzRdT0k_VkWoWIBJaND83xIt4r1Esg5bS2-h5EOj6UevN3SrDw_wIzrL36tGy",
  },
  {
    name: "Mike Thompson",
    role: "Cat Dad",
    text: "The free coloring page hooked me — the AI preview of my cat as a Royal Portrait was hilarious and shockingly good. Ordered the full kit the same day.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoqeaXSSHUy2eDGn7V0ZTx074rGs-efhW8x5aY3FYK7XbIPp7GA217gypt9ddqfvkrdJ5fs8skZ2jqBtha7upXaNeq1GVriYUSzkR4cusAnBIF1WGMx6IyGJ8hsTuIjjTPyWYh4UXNdnwpQen8k7m7O0Udt8pTkvVi8SYmhm-QPYQxp1gFvKzmPg7MuBMYBBLawqgmcvxLZ8tZC9-Up2q_anwbFQ-terfG6M-RvIj7KwdZ5fZKCQxWBQt2HYU8K3vG4G2NGqcK44TC",
  },
  {
    name: "Emily Rose",
    role: "Gift Giver",
    text: "I gave my parents a paint kit of their late dog. They spent a weekend painting it together — it turned grief into something beautiful.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuApGasMaJyjxGld3x1QoS2cO0Znl7D27VJ2HCOCSFKjjoFiXLR5C21-rNjN_1lSJUqeKS0re4uPOBSK5az_LVDEMRzlu4TzVlkp6Gr0cQe5zhveaeLM4dct9vWx_CNYCTllPIGhp0xVQQnqYd750JeutMe22CcRh6jKeNBiC3YcXWbZ4MRsDqBFIRNq-pusSAtvHT3kh-S8rs5uoRS2F1tc7vbTrkZle1deAX-pquCC9czqtta71ud4VozZBJ5D0AIKv0Qb29hjIuGu",
  },
];

export default function LandingReviews() {
  return (
    <section className="w-full bg-cream py-20">
      <Container>
        <h2 className="mb-16 text-center font-display text-3xl font-black text-slate-dark md:text-4xl">
          Painted With Love
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <div
              key={i}
              className="flex flex-col gap-6 rounded-xl bg-white p-8"
            >
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, j) => (
                  <span
                    key={j}
                    className="material-symbols-outlined fill-current"
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="text-lg italic text-slate-dark/80">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="mt-auto flex items-center gap-4">
                <div
                  className="size-12 rounded-full bg-slate-200 bg-cover bg-center"
                  style={{ backgroundImage: `url('${review.img}')` }}
                ></div>
                <div>
                  <p className="font-bold text-slate-dark">{review.name}</p>
                  <p className="text-xs text-slate-dark/60">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
