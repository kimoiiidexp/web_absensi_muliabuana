"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRole } from "@/lib/auth";

export default function LoadingScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const role = getRole();
      if (role === "admin") router.push("/admin");
      else router.push("/my-activity");
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#eef5fb] text-center px-6">
      <h1 className="text-3xl font-bold text-[#230d7d]">Absensi Mulia Buana</h1>
      <p className="text-[#230d7d]/70 mt-2">Sistem Presensi SMK Mulia Buana</p>
      <div className="mt-8 w-10 h-10 border-4 border-[#4187b3] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
