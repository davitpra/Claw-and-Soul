import Link from "next/link";

export default function GenerationsPage() {
  const galleryItems = [
    {
      style: "Renaissance",
      date: "Oct 24, 2023",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCx0XnfYcBzyofPRnY4hqNoTSmlZ1t5GP0W-Cx0FYRilC43yCeis24fYPW0G4QE1bmYTwr2M7aWtb0VDqy1s2m_lLlBeDbb25eXk5Hj8mmqp0_E1yAwnDZ7piRijaor0m-OzCSTKNzKeTAWoMhd8hzP9IPKVSvPLjg-JHbLzilbj_Ii3gnkB1Ji-0A6PLxngqacxGmRykjaka00rDU0NZ3hhpg-3UvIE6fKt9BCss1rBJzAcI2iglZwL7q8-Axl9LSXsNOOdCtoysCT",
    },
    {
      style: "Pop Art",
      date: "Sep 15, 2023",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDswVNS-vhw6apsp7gCsz2eskZ-r8uNIWSE7J1u1TBV1v8RWn98MqL5qGWVYVpjef5-gS552xnwDlwuXRmQuPWijaSFQyPFFjzgRM46WjEbdqRZEUzUIydF6_xg08ZDDyOWXAS4Cuhjd6VX9s3Ak_CJI2wgG-rffvRcbbP7hmBkolemZEMAiTX22h9JuY6pJ-5c5epMsaAa0sgZZYDt84vVJhRooIbgiaIeeMsWHAQrrSA_oIZ-9gVJO8WHNj5U0Ly3KgZ68QOTa1Ag",
    },
    {
      style: "Charcoal Sketch",
      date: "Aug 02, 2023",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBI0qmO8Du-iy_txdt2Licp2cESsWizFj2WLiAdJZpkzCxQ_kIaMzW5qda6G-qlEAX_lbPpH5Es_hJ6y3B1dmd3lrRufN5igquJ5jrWdUJYKfzVQBl5VQjGF1YAcvgmu14qhwyO20qJB1Ni6-levUGDEJc_44cDQ_ifxuQpVPO7JTMfWv1JhJipPqsaKquTwg_kkCBpEVg2W0ypFq5z9h77AtNNBLG-kO9H0h5jz2dlOeBL0tU3C1R5gzJaWwk7jF4HoTKpY8gjBNyV",
    },
    {
      style: "Sci-Fi",
      date: "Jul 19, 2023",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdvIiRXePzNa7YzR6ohFHLEfQ7-_0jYAWlA0mng8vpOfgUn7el3tJAyZGGLU2uZxJ8bnNVka6JF_-bcQ8ZH0ATals6ZCJmVLqdNIpcJBF8IKkYDQx3iiYRwQZdFFLoCdzD8oeAoKc37hgUoSDdrCJvPqJso4YsUXUGaURoc-wLh24lMKwmpQuVpWo61Y9oPbj0scsYQN8rJ52OYJn8Vo6BxDlVG1aL1d1WV555phmpSZW2S-6w18nIxlutbRJ-mcrA7REGapkC_Urt",
    },
    {
      style: "Watercolor",
      date: "Jun 05, 2023",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfV8aQAipcGos30uXurTv_DC_Aua_3_lP_ZHT00cU6TCJcUldrWk7ip23Jmx_hoiDcNAneZOsVwnpsWBvrxcaQyecIImYtB4WE7owgjXzR-P2y4NTvuGwONfdBqRCWox3F78HUcQYcA1YCJQTuviG5sszJBBxNrg-1j63wlzrYHfdKiwhx7D4mWQk3T6N5sMUXihrsqsC9ukYTERvx-JA2uJIw2favwQ488bLukcX1-G00njOWuUfZCVgYEs2JimR-CejAt1vBQYLf",
    },
  ];

  return (
    <>
      <div className="flex justify-between items-end px-4 pb-6">
        <h2 className="text-slate-dark tracking-tight text-[28px] font-bold leading-tight font-display">
          My Soul Gallery
        </h2>
        <Link
          href="/shop"
          className="hidden sm:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-primary-dark transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">
            add_photo_alternate
          </span>
          Create New
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 pb-10">
        {galleryItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-3 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer border border-slate-dark/5"
          >
            <div className="relative overflow-hidden rounded-lg mb-3 aspect-[4/5]">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${item.img}')` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <button className="bg-white text-slate-dark text-xs font-bold py-2 px-4 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  View Full Size
                </button>
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <div className="inline-block px-2 py-1 bg-cream rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-dark mb-1">
                  {item.style}
                </div>
                <p className="text-xs text-slate-dark/60 font-medium">
                  {item.date}
                </p>
              </div>
              <button
                className="text-slate-dark/40 hover:text-primary hover:bg-cream p-2 rounded-full transition-colors"
                title="Order Print"
              >
                <span className="material-symbols-outlined text-[20px]">
                  shopping_bag
                </span>
              </button>
            </div>
          </div>
        ))}

        {/* Create New Placeholder */}
        <Link
          href="/shop"
          className="bg-white/50 border-2 border-dashed border-slate-dark/20 rounded-xl p-3 flex flex-col items-center justify-center min-h-[300px] hover:border-primary/50 hover:bg-white transition-all cursor-pointer group"
        >
          <div className="bg-cream rounded-full p-4 mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary text-[32px]">
              add
            </span>
          </div>
          <p className="text-slate-dark font-bold text-sm">
            Create New Masterpiece
          </p>
          <p className="text-slate-dark/50 text-xs mt-1">
            Try a new style today
          </p>
        </Link>
      </div>

      {/* Mobile Floating Action Button */}
      <Link
        href="/shop"
        className="sm:hidden fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-xl z-50 flex items-center justify-center"
      >
        <span className="material-symbols-outlined">add_photo_alternate</span>
      </Link>
    </>
  );
}
