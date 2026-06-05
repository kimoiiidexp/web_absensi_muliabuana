"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Download } from "lucide-react";

interface Student {
  SiswaID: number;
  Name: string;
  Email: string;
  Phone: string;
}

interface AttendanceRecord {
  siswaID: number;
  name: string;
  hadir: number;
  izin: number;
  alpa: number;
  terlambat: number;
}

export default function RekapAbsensiGuruPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [kelasId, setKelasId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const kelas = params.get("kelas_id");
    if (kelas) {
      setKelasId(kelas);
      fetchStudents(kelas);
    }
  }, []);

  const fetchStudents = async (kelasID: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/guru/students?kelas_id=${kelasID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudents(data || []);
        
        // Mock attendance data - replace with real API call
        const mockAttendance = (data || []).map((student: Student) => ({
          siswaID: student.SiswaID,
          name: student.Name,
          hadir: Math.floor(Math.random() * 20),
          izin: Math.floor(Math.random() * 5),
          alpa: Math.floor(Math.random() * 3),
          terlambat: Math.floor(Math.random() * 2),
        }));
        setAttendance(mockAttendance);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter((record) =>
    record.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-[48px] h-[48px] rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#4187b3]/10 text-[#230d7d] hover:shadow-md transition"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-3xl font-bold text-[#230d7d]">Rekap Absensi</h1>
        </div>
        <button className="px-6 py-3 rounded-xl bg-[#4187b3] text-white font-medium hover:opacity-90 transition flex items-center gap-2">
          <Download size={20} />
          Export
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-8">
        <div className="relative">
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
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[20px] shadow-md overflow-hidden border border-[#4187b3]/10">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]"></div>
          </div>
        ) : filteredAttendance.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-[#230d7d]/70">Tidak ada data siswa</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#eef5fb] border-b border-[#4187b3]/10">
              <tr>
                <th className="px-6 py-4 text-left text-[#230d7d] font-semibold">
                  Nama Siswa
                </th>
                <th className="px-6 py-4 text-center text-[#230d7d] font-semibold">
                  Hadir
                </th>
                <th className="px-6 py-4 text-center text-[#230d7d] font-semibold">
                  Izin
                </th>
                <th className="px-6 py-4 text-center text-[#230d7d] font-semibold">
                  Alpa
                </th>
                <th className="px-6 py-4 text-center text-[#230d7d] font-semibold">
                  Terlambat
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record) => (
                <tr
                  key={record.siswaID}
                  className="border-b border-[#4187b3]/10 hover:bg-[#eef5fb]/50 transition"
                >
                  <td className="px-6 py-4 text-[#230d7d] font-medium">
                    {record.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      {record.hadir}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                      {record.izin}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                      {record.alpa}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
                      {record.terlambat}
                    </span>
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

