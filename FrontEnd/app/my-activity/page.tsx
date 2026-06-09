"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getRole } from "@/lib/auth";
import { ScanLine, School, ClipboardCheck, BarChart3, History } from "lucide-react";

function ActionCard({ title, icon, link }: { title: string; icon: React.ReactNode; link: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(link)}
      className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 border border-[#4187b3]/10 hover:shadow-md transition min-h-[140px] w-full"
    >
      <div className="w-16 h-16 rounded-full bg-[#eef5fb] flex items-center justify-center text-[#4187b3]">
        {icon}
      </div>
      <p className="text-[#230d7d] font-semibold text-sm sm:text-base">{title}</p>
    </button>
  );
}

export default function MyActivityPage() {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "guru" | "siswa" | null>(null);

  useEffect(() => {
    const r = getRole();
    if (r === "admin") {
      router.replace("/admin");
      return;
    }
    setRole(r);
  }, [router]);

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef5fb]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]" />
      </div>
    );
  }

  const siswaActions = [
    { title: "Scan QR", icon: <ScanLine size={28} />, link: "/absen" },
    { title: "Kelas Saya", icon: <School size={28} />, link: "/kelas" },
    { title: "Statistik", icon: <BarChart3 size={28} />, link: "/rekap-absensi-siswa" },
    { title: "Riwayat", icon: <History size={28} />, link: "/riwayat-absen" },
  ];

  const guruActions = [
    { title: "Kehadiran Siswa", icon: <ClipboardCheck size={28} />, link: "/kehadiran-siswa" },
    { title: "Absen Guru", icon: <ScanLine size={28} />, link: "/absen-guru" },
    { title: "Rekap Absensi", icon: <BarChart3 size={28} />, link: "/rekap-absensi-guru" },
    { title: "Riwayat", icon: <History size={28} />, link: "/riwayat-absen" },
  ];

  const actions = role === "guru" ? guruActions : siswaActions;

  return (
    <AppShell title="Dashboard">
      <div className="bg-[#cfe5f5] rounded-2xl p-4 sm:p-8 border border-[#4187b3]/10 mb-6">
        <h3 className="text-lg font-bold text-[#230d7d] mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((a) => (
            <ActionCard key={a.link} {...a} />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-[#4187b3]/10">
        <h3 className="text-lg font-bold text-[#230d7d] mb-2">Selamat Datang</h3>
        <p className="text-[#230d7d]/70 text-sm">
          Gunakan menu di sidebar untuk mengakses seluruh fitur absensi.
        </p>
      </div>
    </AppShell>
  );
}
