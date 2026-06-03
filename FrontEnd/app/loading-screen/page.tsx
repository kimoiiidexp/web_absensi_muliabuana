"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoadingScreen() {
  const router = useRouter();

  useEffect(() => {
    // delay 2 detik lalu redirect
    const timer = setTimeout(() => {
      router.push("/my-activity");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5] text-center px-6">

      {/* LOGO */}
      <Image
        src="/logo-absen.png"
        alt="SmartAbsen"
        width={160}
        height={160}
        className="w-40 h-auto mb-6"
      />

      {/* TITLE */}
      <h1 className="text-3xl font-semibold text-[#2d3ea8]">
        SmartAbsen
      </h1>

      <p className="text-[#2d3ea8] italic mt-2">
        Smart Attendance System
      </p>

      <p className="text-[#2d3ea8] mt-2">
        Sistem Presensi siswa SMK Mulia Buana
      </p>

      <p className="text-[#2d3ea8] mt-6">
        Kerja Sama Projek Kerja Praktik
      </p>

      {/* LOGO BAWAH */}
      <div className="flex gap-6 mt-6">
        <Image
          src="/logo-unpam.png"
          alt="Logo Universitas Pamulang"
          width={64}
          height={64}
          className="w-16 h-auto"
        />
        <Image
          src="/logo-mb.png"
          alt="Logo SMK Mulia Buana"
          width={64}
          height={64}
          className="w-16 h-auto"
        />
      </div>

      {/* LOADING */}
      <div className="mt-8">
        <div className="w-8 h-8 border-4 border-[#2d3ea8] border-t-transparent rounded-full animate-spin"></div>
      </div>

    </div>
  );
}
