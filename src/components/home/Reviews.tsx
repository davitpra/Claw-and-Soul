export default function Reviews() {
  const reviews = [
    {
      name: "Sarah Jenkins",
      role: "Dog Mom",
      text: "The detail captured in the painting made me cry happy tears. It looks exactly like my Bailey. The best gift I've ever bought myself.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAlEqxrMbBlDw8MoQ3NO9mL8SFOoh4tCkiMv3CYhMmX79AQ2__ZZHq-1ilP2ITmmLOh_7O_xhM2N1hvxRbdW7vJqf5ony1_ZrPuC1NVgGdqLcCm74gQ5KTwC0FQcH5AfnXUIBKmwUlyFxQJSeb9oeOrBgYd35laAzIbEPvazaHuwRo3MiZlbDdCyzxz6cICyXQ4eFnO-J9IltfikGmzRdT0k_VkWoWIBJaND83xIt4r1Esg5bS2-h5EOj6UevN3SrDw_wIzrL36tGy",
    },
    {
      name: "Mike Thompson",
      role: "Cat Dad",
      text: "Super easy process. I uploaded a goofy photo of my cat and the Royal Portrait outcome is hilarious and high quality.",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoqeaXSSHUy2eDGn7V0ZTx074rGs-efhW8x5aY3FYK7XbIPp7GA217gypt9ddqfvkrdJ5fs8skZ2jqBtha7upXaNeq1GVriYUSzkR4cusAnBIF1WGMx6IyGJ8hsTuIjjTPyWYh4UXNdnwpQen8k7m7O0Udt8pTkvVi8SYmhm-QPYQxp1gFvKzmPg7MuBMYBBLawqgmcvxLZ8tZC9-Up2q_anwbFQ-terfG6M-RvIj7KwdZ5fZKCQxWBQt2HYU8K3vG4G2NGqcK44TC",
    },
    {
      name: "Emily Rose",
      role: "Gift Giver",
      text: "I got a puzzle for my parents with their late dog on it. The quality of the pieces and the print was exceptional. Thank you!",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuApGasMaJyjxGld3x1QoS2cO0Znl7D27VJ2HCOCSFKjjoFiXLR5C21-rNjN_1lSJUqeKS0re4uPOBSK5az_LVDEMRzlu4TzVlkp6Gr0cQe5zhveaeLM4dct9vWx_CNYCTllPIGhp0xVQQnqYd750JeutMe22CcRh6jKeNBiC3YcXWbZ4MRsDqBFIRNq-pusSAtvHT3kh-S8rs5uoRS2F1tc7vbTrkZle1deAX-pquCC9czqtta71ud4VozZBJ5D0AIKv0Qb29hjIuGu",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <h2 className="text-3xl font-black text-slate-dark md:text-4xl text-center mb-16">
          Pawsitive Reviews
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="bg-cream/30 p-8 rounded-2xl border border-cream flex flex-col gap-6"
            >
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined fill-current"
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="text-slate-dark/80 italic text-lg">
                "{review.text}"
              </p>
              <div className="flex items-center gap-4 mt-auto">
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
      </div>
    </section>
  );
}
