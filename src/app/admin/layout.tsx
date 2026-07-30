"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "./_components/AdminSidebar";
import PolarisProvider from "./PolarisProvider";

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
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
        <div className="w-8 h-8 rounded-full border-[3px] border-[#e3e3e3] border-t-[#448da6] animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <PolarisProvider>
      <div className="flex min-h-screen w-full bg-[#f4f6f8] font-body">
        <AdminSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-800 mx-auto px-6 py-6">{children}</div>
        </main>
      </div>
    </PolarisProvider>
  );
}
