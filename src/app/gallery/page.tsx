"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const STYLES = [
  {
    id: "idsfn",
    name: "Soulful Oil",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCKykboGNpnd8-jfP_3g7eo3NhGT8LDYaHyLFZdFPBHQX9ENjIq8E89wdY5HI9CmlVuA1MdREfvF6n55H6bp8BzG6K5OG1NZdYOP3oAxkJNLqgFyH-_ITd4YZZAHObVNdamDVl4ScJrwBzbwilMvQ1nqCp35k1fnP1PdkzaCwKouhErNTGGonjfM17ncUgVfkmGV0GnLUgbYZnVHKMXSvNvuXlysFd7Bie7g7-0_k_awgz1rVfUi0lpotPsZoawqRGLBgzH36KoOXgZ",
    aspect: "aspect-[3/4]",
  },
  {
    id: "puzzle",
    name: "Puzzle Piece",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgn4X20uif5vo52qIG-bYVydOt_JjwCUQKWGHXfqcJW446ByP_g1a5E2j9bG0XmshnWhWveQKT54Wk2QkVqEggcZsyQdpdhxcs_vnrbgpKAq9Lpfx08b9O7U5iU0hqVzmDnHC-2pCjVy4hHxS-gY1dAvEKN1hjJSWkqfGG1S446kY1tOM-BNy8Tka1USm9tdQclt_Py3JSeBbEksv6mbVxU6nEvbeaamONlH1lzPYc-g_VMNYfeiHWxsZTEZSV1Q5HSGzxm7bENrGX",
    aspect: "aspect-square",
  },
  {
    id: "animated",
    name: "Digital Spirit",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD9RBf8O7lnIIx8E7o2p-kJQ1J4osuWuPVNPm1mTRvfPkl8V49BVAkh4NA9WB4IGBM_yJ-YVsGeabPEhByCwMmE8a-TPijvWMYQBIYpAMY1Jikor69rDuxJS-CYdnwmWP39sZm2tZMD_GwZEN4D91Ij_tEUFmLsgU8qW4zZFRZ3q8khvVAfGgz14GWJh6prXDXVdEmFN1QQyNiM5ZrMhTKkLJj8Ti53GKSPDbdmnbYgxZxp4qCJNwZUplo3azOMG7nyd5Ab-A1_f_dk",
    aspect: "aspect-[4/3]",
  },
  {
    id: "coloring",
    name: "Pencil Essence",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8X23E-ruViRdbKVwh7rS1uRDudxKbx2C74aO3evG3xo5CIE9i73FQBNBYACeFqUPb6C3KzMtTqCznDuAErTovf5rcy7LJuev3OLPFcp_3b0KWw3x7B3el6sTcUNGapAsjYZUv-TQZuIynXL0K6oOsL7SCOaMfK8YIi0vavUTDHJ3bkZwNKAOTeaTVuNjqxT2VkJ8Z389JE9zCPJc9jhor4B_4zlwWQocuLF2AZneUjtehdnih9B2TLraIgNqTjyOihxfpcKY243af",
    aspect: "aspect-[2/3]",
  },
  {
    id: "watercolor",
    name: "Dreamy Watercolor",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBdeQ6pJJUWkbpkKWNcg0VHFvXvG_FfUaepmJ8uwLF2WZ-POcpaPgBdIcZ6dAEAHPvIHnrJn989yUxKh5hqQQ4JZ7TZ8biE_Zps-frykFL8qE6PlrG3dtRkSDiBQSv6BUq1Phhlmea4l7dEXQWE_-63R39h8eXig8ohJ7zjvohTPnEc4avrGwOn1Td9L_gQpwXxrU8zWDc6v_PFq-JYTow5QScEzqO5B9O0sjIViBnViazW7nTBl8TMIujdCbrx9jzQPjpMD-uvnALF",
    aspect: "aspect-square",
  },
  {
    id: "modern",
    name: "Modern Muse",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCivOJ9FvpSdMW3Yp_Q9oerQRFB5pBL59Ir3OGq7y95gFzPl6Y30E7rSnuX3D2VLF40QGTAwMpvbKizGFW762YVhTzSPN7qVkAf-PiXUHCPBh-4qZLYEMsk2_DSaILUaeeFP_h4BlFWTI4BKcDy0CpxKlUj3srmgCk-l2Wp7HAa5M4ia-4oBK7PiBJK9fsNfv25ZFcyqFfPlod_30ypuagj8vBUE1S06uOrrl0Jke13oHWBwXrz6B_zgHkQ7tVC1lTKGIqg_ttgNmwE",
    aspect: "aspect-[3/4]",
  },
];

export default function GalleryPage() {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 text-center px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-dark tracking-tight leading-tight">
              Select Your Style
            </h1>
            <p className="text-lg md:text-xl text-slate-dark/80 font-medium max-w-2xl mx-auto leading-relaxed">
              Choose an artistic transformation for your furry friend. Click a
              style to select it.
            </p>
          </div>
        </section>

        {/* Style Grid */}
        <section className="max-w-[1280px] mx-auto px-4 pb-32">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {STYLES.map((style) => (
              <div
                key={style.id}
                className="break-inside-avoid mb-6"
                onClick={() => setSelectedStyle(style.id)}
              >
                <div
                  className={`relative group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 border-4 ${
                    selectedStyle === style.id
                      ? "border-primary"
                      : "border-transparent"
                  } hover:shadow-xl`}
                >
                  <div className={`relative w-full ${style.aspect}`}>
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url('${style.image}')` }}
                    />

                    {/* Selected Mark */}
                    {selectedStyle === style.id && (
                      <div className="absolute top-4 right-4 z-20 bg-white text-primary rounded-full p-1 shadow-md flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">
                          check_circle
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div
                      className={`absolute inset-0 bg-primary/20 transition-opacity duration-300 flex items-center justify-center ${
                        selectedStyle === style.id
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <span className="bg-white text-primary font-bold py-3 px-6 rounded-xl shadow-lg transform scale-95 group-hover:scale-100 transition-all">
                        {selectedStyle === style.id
                          ? "Selected"
                          : "Select this Style"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-bold text-slate-dark">
                    {style.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FAB */}
      {selectedStyle && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-50 animate-bounce">
          <Link
            href="/upload"
            className="bg-primary hover:bg-primary-dark text-white rounded-full pl-8 pr-4 py-4 h-16 shadow-2xl flex items-center gap-4 transition-transform hover:scale-105 group"
          >
            <span className="font-bold text-lg whitespace-nowrap">
              Next: Upload Photo
            </span>
            <div className="bg-white text-primary rounded-full size-10 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
              <span className="material-symbols-outlined font-bold">
                arrow_forward
              </span>
            </div>
          </Link>
        </div>
      )}

      <Footer />
    </div>
  );
}
