"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { authFetch, parseJson } from "@/lib/auth";
import { Users, School, ClipboardCheck, CheckCircle, XCircle } from "lucide-react";

interface DashboardStats {
  total_siswa: number;
  total_guru: number;
  total_kelas: number;
  total_sessions: number;
  total_hadir: number;
  total_alpa: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    authFetch("/api/admin/dashboard")
      .then((r) => parseJson<DashboardStats>(r))
      .then(setStats)
      .catch(console.error);
  }, []);

  const cards = [
    { label: "Total Siswa", value: stats?.total_siswa ?? 0, icon: <Users className="text-[#4187b3]" /> },
    { label: "Total Guru", value: stats?.total_guru ?? 0, icon: <Users className="text-[#4187b3]" /> },
    { label: "Total Kelas", value: stats?.total_kelas ?? 0, icon: <School className="text-[#4187b3]" /> },
    { label: "Total Session", value: stats?.total_sessions ?? 0, icon: <ClipboardCheck className="text-[#4187b3]" /> },
    { label: "Total Hadir", value: stats?.total_hadir ?? 0, icon: <CheckCircle className="text-green-600" /> },
    { label: "Total Alpa", value: stats?.total_alpa ?? 0, icon: <XCircle className="text-red-600" /> },
  ];

  return (
    <AppShell title="Dashboard Admin">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-6 border border-[#4187b3]/10 shadow-sm">
            <div className="flex items-center gap-3 mb-3">{c.icon}</div>
            <p className="text-sm text-[#230d7d]/60">{c.label}</p>
            <p className="text-3xl font-bold text-[#230d7d] mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
