"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, BookOpen, Clock } from "lucide-react";

interface Kelas {
  id: number;
  name: string;
  jurusan: string;
  guru: string;
  siswaCount: number;
  schedule: string;
}

export default function KelasPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/siswa/kelas`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setKelas(data || []);
      }
    } catch (error) {
      console.error("Error fetching kelas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef5fb]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef5fb] p-8">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-[48px] h-[48px] rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#4187b3]/10 text-[#230d7d] hover:shadow-md transition"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-3xl font-bold text-[#230d7d]">Kelas Saya</h1>
      </div>

      {/* KELAS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]"></div>
          </div>
        ) : kelas.length === 0 ? (
          <div className="col-span-full bg-white rounded-[15px] p-12 text-center border border-[#4187b3]/10">
            <p className="text-[#230d7d]/70">Belum ada kelas yang ditugaskan</p>
          </div>
        ) : (
          kelas.map((k) => (
            <div
              key={k.id}
              className="bg-white rounded-[20px] p-6 border border-[#4187b3]/10 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/kelas/${k.id}`)}
            >
              {/* HEADER */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#230d7d] mb-2">
                  {k.name}
                </h2>
                <p className="text-[#4187b3] font-medium">{k.jurusan}</p>
              </div>

              {/* INFO */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-[#230d7d]/70">
                  <BookOpen size={20} className="text-[#4187b3]" />
                  <div>
                    <p className="text-sm text-[#230d7d]/50">Guru Pengajar</p>
                    <p className="font-medium">{k.guru}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#230d7d]/70">
                  <Users size={20} className="text-[#4187b3]" />
                  <div>
                    <p className="text-sm text-[#230d7d]/50">Jumlah Siswa</p>
                    <p className="font-medium">{k.siswaCount} siswa</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#230d7d]/70">
                  <Clock size={20} className="text-[#4187b3]" />
                  <div>
                    <p className="text-sm text-[#230d7d]/50">Jadwal</p>
                    <p className="font-medium">{k.schedule}</p>
                  </div>
                </div>
              </div>

              {/* BUTTON */}
              <button className="w-full px-4 py-3 rounded-xl bg-[#4187b3] text-white font-medium hover:opacity-90 transition">
                Lihat Detail
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

