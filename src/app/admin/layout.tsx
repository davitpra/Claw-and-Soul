"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/widgets/admin-sidebar/AdminSidebar";
import { useAuth } from "@/context/AuthContext";
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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f6f8",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid #e3e3e3",
            borderTopColor: "#448da6",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <PolarisProvider>
      <div className="flex min-h-screen w-full bg-[#f4f6f8] font-body">
        <AdminSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-6">{children}</div>
        </main>
      </div>
    </PolarisProvider>
  );
}
