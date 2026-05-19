"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import AdminSidebar from "@/widgets/admin-sidebar/AdminSidebar";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-3xl">
          progress_activity
        </span>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-cream font-body">
      <Navbar />
      <div className="flex flex-1 max-w-[1280px] mx-auto w-full px-6 lg:px-10 py-8 gap-8">
        <AdminSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
