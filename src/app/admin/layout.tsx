"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
    <div className="flex min-h-screen w-full bg-[#f7f6f2] font-body">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
