"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <p className="text-[#230d7d] text-lg font-semibold">Membuka halaman login...</p>
    </main>
  );
}
