"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Filter } from "lucide-react";

export default function KehadiranSiswaPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Fetch attendance data from backend
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/attendance/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const data = await response.json();
      setAttendanceData(data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
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
        <h1 className="text-3xl font-bold text-[#230d7d]">Kehadiran Siswa</h1>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#230d7d]/50"
          />
          <input
            type="text"
            placeholder="Cari siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-[#4187b3]/10 text-[#230d7d] placeholder-[#230d7d]/50 focus:outline-none focus:ring-2 focus:ring-[#4187b3]"
          />
        </div>
        <button className="px-6 py-3 rounded-xl bg-white border border-[#4187b3]/10 text-[#230d7d] hover:shadow-md transition flex items-center gap-2">
          <Filter size={20} />
          Filter
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[20px] shadow-md overflow-hidden border border-[#4187b3]/10">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]"></div>
          </div>
        ) : attendanceData.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-[#230d7d]/70">Tidak ada data kehadiran</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#eef5fb] border-b border-[#4187b3]/10">
              <tr>
                <th className="px-6 py-4 text-left text-[#230d7d] font-semibold">
                  Nama Siswa
                </th>
                <th className="px-6 py-4 text-left text-[#230d7d] font-semibold">
                  NIS
                </th>
                <th className="px-6 py-4 text-left text-[#230d7d] font-semibold">
                  Kelas
                </th>
                <th className="px-6 py-4 text-left text-[#230d7d] font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-[#230d7d] font-semibold">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-[#4187b3]/10 hover:bg-[#eef5fb]/50 transition"
                >
                  <td className="px-6 py-4 text-[#230d7d]">{item.name}</td>
                  <td className="px-6 py-4 text-[#230d7d]/70">{item.nis}</td>
                  <td className="px-6 py-4 text-[#230d7d]/70">{item.class}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === "Hadir"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Izin"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#230d7d]/70">
                    {item.time || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

