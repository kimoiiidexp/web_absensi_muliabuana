"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { authFetch, parseJson } from "@/lib/auth";
import { Users, BookOpen } from "lucide-react";

interface KelasInfo {
  id: number;
  name: string;
  jurusan: string;
  siswa_count: number;
  mapel_list: string[];
  guru_list: string[];
}

export default function KelasPage() {
  const [kelas, setKelas] = useState<KelasInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/api/siswa/kelas")
      .then((r) => parseJson<KelasInfo[]>(r))
      .then(setKelas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="Kelas Saya">
      <PageHeader title="Kelas Saya" back />
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]" />
        </div>
      ) : kelas.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-[#230d7d]/70 border border-[#4187b3]/10">
          Belum terdaftar di kelas manapun
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {kelas.map((k) => (
            <div key={k.id} className="bg-white rounded-2xl p-6 border border-[#4187b3]/10">
              <h2 className="text-xl font-bold text-[#230d7d]">{k.name}</h2>
              <p className="text-[#4187b3] font-medium mt-1">{k.jurusan}</p>
              <div className="mt-4 space-y-3 text-sm text-[#230d7d]/80">
                <div className="flex items-start gap-2">
                  <Users size={18} className="text-[#4187b3] mt-0.5 shrink-0" />
                  <span>{k.siswa_count} siswa di kelas ini</span>
                </div>
                <div className="flex items-start gap-2">
                  <BookOpen size={18} className="text-[#4187b3] mt-0.5 shrink-0" />
                  <span>Mapel: {k.mapel_list?.join(", ") || "-"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Users size={18} className="text-[#4187b3] mt-0.5 shrink-0" />
                  <span>Guru: {k.guru_list?.join(", ") || "-"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
