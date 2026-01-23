"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "Profile Information", href: "/user/profile", icon: "person" },
    { name: "My Generations", href: "/user/generations", icon: "grid_view" },
    { name: "Order History", href: "/user/orders", icon: "history" },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-cream overflow-x-hidden font-body">
      <Navbar />
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Profile Header */}
            <div className="flex flex-col items-center justify-center pb-8 pt-4">
              <div className="relative mb-4">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-white shadow-lg"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuApx2E4-jUdm8y7Tyagjbkrfi9burAjFMa71vM7iU_1-AXeVyjMZPwFpdm98I9RCWJWrAkR9jY9l-UrHBpO8zsHoc58W6B8SeUaHr33Tp3wD8fn4Tu7B-7MRM80YnTy_m8zxo0zbcAu0NCuY25nluw2bWJ0SoETk2sfi6NW_H-4skLa_p9T12jYLx1YSHuRLz9FBG5EsFwSmtwbdgyzg2DvDkrmvYgY6CamtBYkj091Ho1DPM6A5g-bhUENfwkLAO2UysyT_t66yqzf')",
                  }}
                ></div>
                <button className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md text-slate-dark hover:text-primary transition-colors border border-slate-dark/10">
                  <span className="material-symbols-outlined text-[18px] block">
                    edit
                  </span>
                </button>
              </div>
              <h1 className="text-slate-dark text-[28px] font-bold leading-tight tracking-[-0.015em] text-center font-display">
                Sarah & Mittens
              </h1>
              <p className="text-slate-dark/70 text-base font-normal leading-normal text-center mt-1">
                Member since 2022
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="sticky top-[73px] bg-cream z-40 pb-6 pt-2">
              <nav className="flex border-b border-slate-dark/10 px-4 gap-8 overflow-x-auto whitespace-nowrap">
                {tabs.map((tab) => {
                  const isActive = pathname === tab.href;
                  return (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      className={`flex items-center gap-2 border-b-[3px] pb-3 px-2 transition-all group ${
                        isActive
                          ? "border-primary text-primary"
                          : "border-transparent text-slate-dark/60 hover:border-slate-dark/20 hover:text-slate-dark"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          isActive ? "text-primary" : ""
                        }`}
                      >
                        {tab.icon}
                      </span>
                      <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                        {tab.name}
                      </p>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {children}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
