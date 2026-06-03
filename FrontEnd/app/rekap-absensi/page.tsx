"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Filter,
  User,
  Download,
  Edit3,
  Save,
  X,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Camera,
  Clock,
} from "lucide-react";
import { apiUrl } from "@/lib/api";

// Types
interface GuruMapelKelasDetail {
  ID: number;
  GuruID: number;
  KelasID: number;
  MapelID: number;
  KelasName: string;
  JurusanID: number;
  JurusanName: string;
  MapelName: string;
}

interface Siswa {
  SiswaID: number;
  KelasID: number;
  Name: string;
  Email: string;
  Phone: string;
}

interface CatatanSiswa {
  [siswaID: number]: string;
}

interface AbsensiSiswa {
  [siswaID: number]: {
    status: "hadir" | "terlambat" | "izin" | "alpa";
    waktu_absen: string;
    foto_path?: string;
    keterangan_izin?: string;
  };
}

interface CatatanItem {
  siswa_id: number;
  catatan: string;
}

export default function RekapAbsensiPage() {
  const router = useRouter();

  // State
  const [guruMapelKelas, setGuruMapelKelas] = useState<GuruMapelKelasDetail[]>([]);
  const [selectedJurusan, setSelectedJurusan] = useState<string>("");
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [selectedMapel, setSelectedMapel] = useState<string>("");
  const [selectedTanggal, setSelectedTanggal] = useState<string>("");
  const [students, setStudents] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCatatan, setEditingCatatan] = useState<number | null>(null);
  const [catatanSiswa, setCatatanSiswa] = useState<CatatanSiswa>({});
  const [tempCatatan, setTempCatatan] = useState("");
  const [absensiData, setAbsensiData] = useState<AbsensiSiswa>({});

  // Fetch functions - defined first to avoid hoisting issues
  const fetchStudents = useCallback(async (kelasID: string) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        apiUrl(`/api/guru/students?kelas_id=${kelasID}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCatatan = useCallback(async (kelasID: string) => {
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(
        apiUrl(`/api/guru/catatan?kelas_id=${kelasID}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json() as CatatanItem[];
        const catatanMap: CatatanSiswa = {};
        data.forEach((item) => {
          catatanMap[item.siswa_id] = item.catatan;
        });
        setCatatanSiswa(catatanMap);
      }
    } catch (err) {
      console.error("Failed to fetch catatan:", err);
    }
  }, []);

  const fetchAbsensi = useCallback(async () => {
    try {
      // Fetch from absensi_siswa table (need to create endpoint for this)
      // For now, we'll use mock data structure
      const absensiMap: AbsensiSiswa = {};
      setAbsensiData(absensiMap);
    } catch (err) {
      console.error("Failed to fetch absensi:", err);
    }
  }, []);

  // Fetch guru's mapel-kelas on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchGuruMapelKelas = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(apiUrl("/api/guru/mapel-kelas"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setGuruMapelKelas(data);
        }
      } catch (err) {
        console.error("Failed to fetch guru mapel kelas:", err);
      }
    };

    fetchGuruMapelKelas();
  }, [router]);

  // Fetch students when kelas is selected
  useEffect(() => {
    if (selectedKelas) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchStudents(selectedKelas);
      fetchCatatan(selectedKelas);
      if (selectedTanggal) {
        fetchAbsensi();
      }
    }
  }, [selectedKelas, selectedTanggal, fetchStudents, fetchCatatan, fetchAbsensi]);

  // Get unique values for filters
  const jurusanList = Array.from(
    new Map(
      guruMapelKelas
        .filter((g) => g.JurusanName)
        .map((g) => [g.JurusanID, { ID: g.JurusanID, Name: g.JurusanName }])
    ).values()
  );

  const kelasList = guruMapelKelas.filter(
    (g) => !selectedJurusan || g.JurusanID === Number(selectedJurusan)
  );

  const mapelList = Array.from(
    new Map(
      guruMapelKelas
        .filter(
          (g) =>
            g.MapelID &&
            (!selectedKelas || g.KelasID === Number(selectedKelas))
        )
        .map((g) => [g.MapelID, { ID: g.MapelID, Name: g.MapelName }])
    ).values()
  );

  // Save catatan to database
  const handleSaveCatatan = async (siswaID: number) => {
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(apiUrl("/api/guru/catatan"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          siswa_id: siswaID,
          kelas_id: parseInt(selectedKelas),
          catatan: tempCatatan,
        }),
      });

      if (res.ok) {
        // Update local state
        setCatatanSiswa({
          ...catatanSiswa,
          [siswaID]: tempCatatan,
        });
        setEditingCatatan(null);
        setTempCatatan("");
      }
    } catch (err) {
      console.error("Failed to save catatan:", err);
    }
  };

  const handleEditCatatan = (siswaID: number, currentCatatan: string) => {
    setEditingCatatan(siswaID);
    setTempCatatan(currentCatatan);
  };

  // Filter students by search query
  const filteredStudents = students.filter((student) =>
    student.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["No", "Nama", "Email", "No. Telepon", "Catatan", "Status Absen"];
    const rows = filteredStudents.map((student, index) => [
      index + 1,
      student.Name,
      student.Email,
      student.Phone || "-",
      catatanSiswa[student.SiswaID] || "-",
      absensiData[student.SiswaID]?.status || "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `rekap_absensi_${selectedTanggal || new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "hadir":
        return "bg-green-100 text-green-700";
      case "terlambat":
        return "bg-yellow-100 text-yellow-700";
      case "izin":
        return "bg-blue-100 text-blue-700";
      case "alpa":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#ececec]">
      {/* HEADER */}
      <div className="bg-[#ece8b8] rounded-b-[24px] px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="w-[45px] h-[45px] rounded-xl bg-white/70 flex items-center justify-center hover:bg-white/90 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <button className="w-[45px] h-[45px] rounded-xl bg-white/70 flex items-center justify-center hover:bg-white/90 transition">
            <User size={24} />
          </button>
        </div>

        <h1 className="text-[32px] font-bold text-[#111827]">Rekap Absensi</h1>
        <p className="text-[16px] text-[#111827]/70 mt-2">
          Lihat rekap absensi dan catatan siswa per kelas
        </p>
      </div>

      {/* CONTENT */}
      <div className="px-8 py-10">
        {/* FILTER SECTION */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter size={22} className="text-[#230d7d]" />
            <h2 className="text-xl font-bold text-[#230d7d]">Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Jurusan */}
            <div className="relative">
              <label className="text-sm text-[#230d7d]/70 mb-2 block">
                Jurusan
              </label>
              <div className="relative">
                <select
                  value={selectedJurusan}
                  onChange={(e) => {
                    setSelectedJurusan(e.target.value);
                    setSelectedKelas("");
                    setSelectedMapel("");
                    setStudents([]);
                  }}
                  className="w-full h-[50px] border-2 border-[#4187b3]/30 rounded-[12px] px-4 pr-10 text-[#230d7d] focus:outline-none focus:border-[#4187b3] appearance-none bg-white"
                >
                  <option value="">Semua Jurusan</option>
                  {jurusanList.map((j) => (
                    <option key={j?.ID} value={j?.ID}>
                      {j?.Name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#230d7d]/50 pointer-events-none"
                />
              </div>
            </div>

            {/* Kelas */}
            <div className="relative">
              <label className="text-sm text-[#230d7d]/70 mb-2 block">
                Kelas
              </label>
              <div className="relative">
                <select
                  value={selectedKelas}
                  onChange={(e) => {
                    setSelectedKelas(e.target.value);
                    setSelectedMapel("");
                    setSelectedTanggal("");
                  }}
                  className="w-full h-[50px] border-2 border-[#4187b3]/30 rounded-[12px] px-4 pr-10 text-[#230d7d] focus:outline-none focus:border-[#4187b3] appearance-none bg-white"
                >
                  <option value="">Pilih Kelas</option>
                  {kelasList.map((k) => (
                    <option key={k.KelasID} value={k.KelasID}>
                      {k.KelasName}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#230d7d]/50 pointer-events-none"
                />
              </div>
            </div>

            {/* Mapel */}
            <div className="relative">
              <label className="text-sm text-[#230d7d]/70 mb-2 block">
                Mata Pelajaran
              </label>
              <div className="relative">
                <select
                  value={selectedMapel}
                  onChange={(e) => setSelectedMapel(e.target.value)}
                  className="w-full h-[50px] border-2 border-[#4187b3]/30 rounded-[12px] px-4 pr-10 text-[#230d7d] focus:outline-none focus:border-[#4187b3] appearance-none bg-white"
                >
                  <option value="">Semua Mapel</option>
                  {mapelList.map((m) => (
                    <option key={m?.ID} value={m?.ID}>
                      {m?.Name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#230d7d]/50 pointer-events-none"
                />
              </div>
            </div>

            {/* Tanggal */}
            <div className="relative">
              <label className="text-sm text-[#230d7d]/70 mb-2 block">
                Tanggal Absensi
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedTanggal}
                  onChange={(e) => setSelectedTanggal(e.target.value)}
                  className="w-full h-[50px] border-2 border-[#4187b3]/30 rounded-[12px] px-4 text-[#230d7d] focus:outline-none focus:border-[#4187b3] appearance-none bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & EXPORT */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#230d7d]/50"
            />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[50px] border-2 border-[#4187b3]/30 rounded-[12px] pl-12 pr-4 text-[#230d7d] placeholder:text-gray-400 focus:outline-none focus:border-[#4187b3]"
            />
          </div>
          <button
            onClick={handleExportCSV}
            disabled={students.length === 0}
            className="h-[50px] px-6 bg-[#4187b3] text-white rounded-[12px] font-semibold flex items-center gap-3 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>

        {/* STUDENTS TABLE */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle size={64} className="text-[#4187b3]/30 mb-4" />
              <p className="text-[#230d7d]/50 text-lg">
                {!selectedKelas
                  ? "Pilih kelas untuk melihat daftar siswa"
                  : "Tidak ada siswa ditemukan"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#4187b3]/10">
                      <th className="text-left py-4 px-4 text-[#230d7d] font-semibold">
                        No
                      </th>
                      <th className="text-left py-4 px-4 text-[#230d7d] font-semibold">
                        Nama Siswa
                      </th>
                      <th className="text-left py-4 px-4 text-[#230d7d] font-semibold">
                        Email
                      </th>
                      <th className="text-left py-4 px-4 text-[#230d7d] font-semibold">
                        Status Absen
                      </th>
                      <th className="text-left py-4 px-4 text-[#230d7d] font-semibold">
                        Waktu
                      </th>
                      <th className="text-left py-4 px-4 text-[#230d7d] font-semibold">
                        Catatan
                      </th>
                      <th className="text-left py-4 px-4 text-[#230d7d] font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => {
                      const absen = absensiData[student.SiswaID];
                      return (
                        <tr
                          key={student.SiswaID}
                          className="border-b border-[#4187b3]/5 hover:bg-[#4187b3]/5 transition"
                        >
                          <td className="py-4 px-4 text-[#230d7d]">
                            {index + 1}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#a5c7dd] flex items-center justify-center text-[#230d7d] font-semibold">
                                {student.Name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-[#230d7d] font-medium">
                                {student.Name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-[#230d7d]/70">
                            {student.Email}
                          </td>
                          <td className="py-4 px-4">
                            {absen ? (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(absen.status)}`}>
                                {absen.status.toUpperCase()}
                              </span>
                            ) : (
                              <span className="text-[#230d7d]/50 text-sm">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-[#230d7d]/70 text-sm">
                            {absen?.waktu_absen ? (
                              <div className="flex items-center gap-2">
                                <Clock size={14} />
                                {new Date(absen.waktu_absen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {editingCatatan === student.SiswaID ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={tempCatatan}
                                  onChange={(e) => setTempCatatan(e.target.value)}
                                  className="flex-1 h-[36px] border border-[#4187b3]/30 rounded-lg px-3 text-sm focus:outline-none focus:border-[#4187b3]"
                                  placeholder="Tambah catatan..."
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveCatatan(student.SiswaID)}
                                  className="w-[36px] h-[36px] rounded-lg bg-[#22c55e] text-white flex items-center justify-center hover:opacity-90 transition"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={() => setEditingCatatan(null)}
                                  className="w-[36px] h-[36px] rounded-lg bg-red-500 text-white flex items-center justify-center hover:opacity-90 transition"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[#230d7d]/70 text-sm">
                                {catatanSiswa[student.SiswaID] || "-"}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {editingCatatan !== student.SiswaID && (
                              <button
                                onClick={() =>
                                  handleEditCatatan(
                                    student.SiswaID,
                                    catatanSiswa[student.SiswaID] || ""
                                  )
                                }
                                className="w-[36px] h-[36px] rounded-lg bg-[#4187b3]/10 text-[#4187b3] flex items-center justify-center hover:bg-[#4187b3]/20 transition"
                              >
                                <Edit3 size={16} />
                              </button>
                            )}
                            {absen?.foto_path && (
                              <button
                                onClick={() => {/* Show foto modal */}}
                                className="w-[36px] h-[36px] rounded-lg bg-[#4187b3]/10 text-[#4187b3] flex items-center justify-center hover:bg-[#4187b3]/20 transition ml-2"
                              >
                                <Camera size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* SUMMARY */}
              <div className="mt-6 pt-6 border-t border-[#4187b3]/10 flex items-center justify-between">
                <p className="text-[#230d7d]/70">
                  Menampilkan{" "}
                  <span className="font-semibold text-[#230d7d]">
                    {filteredStudents.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-[#230d7d]">
                    {students.length}
                  </span>{""}
                  siswa
                  {selectedTanggal && (
                    <span> pada {new Date(selectedTanggal).toLocaleDateString('id-ID')}</span>
                  )}
                </p>
                <div className="flex items-center gap-2 text-[#230d7d]/50 text-sm">
                  <CheckCircle size={16} />
                  <span>Catatan tersimpan ke database</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
