"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AbsenMasukPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/absen-guru");
  }, [router]);
  return null;
}
