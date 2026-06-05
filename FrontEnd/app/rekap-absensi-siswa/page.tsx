"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";

interface AttendanceSummary {
  totalHadir: number;
  totalIzin: number;
  totalAlpa: number;
  totalTerlambat: number;
  attendanceRate: number;
}

interface AttendanceDetail {
  id: number;
  date: string;
  subject: string;
  status: "hadir" | "izin" | "alpa" | "terlambat";
  time?: string;
}

export default function RekapAbsensiSiswaPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<AttendanceSummary>({
    totalHadir: 0,
    totalIzin: 0,
    totalAlpa: 0,
    totalTerlambat: 0,
    attendanceRate: 0,
  });
  const [details, setDetails] = useState<AttendanceDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "hadir" | "izin" | "alpa" | "terlambat">("all");

  useEffect(() => {
    setMounted(true);
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/siswa/rekap-absensi`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary || {
          totalHadir: 0,
          totalIzin: 0,
          totalAlpa: 0,
          totalTerlambat: 0,
          attendanceRate: 0,
        });
        setDetails(data.details || []);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      // Mock data for testing
      setSummary({
        totalHadir: 18,
        totalIzin: 2,
        totalAlpa: 1,
        totalTerlambat: 1,
        attendanceRate: 90,
      });
      setDetails([
        {
          id: 1,
          date: "2026-06-05",
          subject: "Matematika",
          status: "hadir",
          time: "07:30",
        },
        {
          id: 2,
          date: "2026-06-04",
          subject: "Bahasa Indonesia",
          status: "hadir",
          time: "08:00",
        },
        {
          id: 3,
          date: "2026-06-03",
          subject: "Fisika",
          status: "izin",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDetails = details.filter(
    (d) => filterStatus === "all" || d.status === filterStatus
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "hadir":
        return <CheckCircle size={24} className="text-green-600" />;
      case "izin":
        return <AlertCircle size={24} className="text-yellow-600" />;
      case "alpa":
        return <XCircle size={24} className="text-red-600" />;
      case "terlambat":
        return <Clock size={24} className="text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hadir":
        return "bg-green-100 text-green-700";
      case "izin":
        return "bg-yellow-100 text-yellow-700";
      case "alpa":
        return "bg-red-100 text-red-700";
      case "terlambat":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "hadir":
        return "Hadir";
      case "izin":
        return "Izin";
      case "alpa":
        return "Alpa";
      case "terlambat":
        return "Terlambat";
      default:
        return status;
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
        <h1 className="text-3xl font-bold text-[#230d7d]">Rekap Absensi Saya</h1>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-[15px] p-6 border border-[#4187b3]/10 shadow-sm">
          <p className="text-[#230d7d]/70 text-sm mb-2">Hadir</p>
          <p className="text-3xl font-bold text-green-600">{summary.totalHadir}</p>
        </div>
        <div className="bg-white rounded-[15px] p-6 border border-[#4187b3]/10 shadow-sm">
          <p className="text-[#230d7d]/70 text-sm mb-2">Izin</p>
          <p className="text-3xl font-bold text-yellow-600">{summary.totalIzin}</p>
        </div>
        <div className="bg-white rounded-[15px] p-6 border border-[#4187b3]/10 shadow-sm">
          <p className="text-[#230d7d]/70 text-sm mb-2">Alpa</p>
          <p className="text-3xl font-bold text-red-600">{summary.totalAlpa}</p>
        </div>
        <div className="bg-white rounded-[15px] p-6 border border-[#4187b3]/10 shadow-sm">
          <p className="text-[#230d7d]/70 text-sm mb-2">Terlambat</p>
          <p className="text-3xl font-bold text-orange-600">{summary.totalTerlambat}</p>
        </div>
        <div className="bg-gradient-to-br from-[#4187b3] to-[#2d5a8c] rounded-[15px] p-6 shadow-sm">
          <p className="text-white/70 text-sm mb-2">Persentase</p>
          <p className="text-3xl font-bold text-white">{summary.attendanceRate}%</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {["all", "hadir", "izin", "alpa", "terlambat"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition ${
              filterStatus === status
                ? "bg-[#4187b3] text-white"
                : "bg-white text-[#230d7d] border border-[#4187b3]/10 hover:shadow-md"
            }`}
          >
            {status === "all" ? "Semua" : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* DETAILS */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]"></div>
          </div>
        ) : filteredDetails.length === 0 ? (
          <div className="bg-white rounded-[15px] p-12 text-center border border-[#4187b3]/10">
            <p className="text-[#230d7d]/70">Tidak ada data absensi</p>
          </div>
        ) : (
          filteredDetails.map((detail) => (
            <div
              key={detail.id}
              className="bg-white rounded-[15px] p-6 border border-[#4187b3]/10 shadow-sm hover:shadow-md transition flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                {getStatusIcon(detail.status)}
                <div>
                  <h3 className="font-semibold text-[#230d7d]">
                    {detail.subject}
                  </h3>
                  <div className="flex items-center gap-4 text-[#230d7d]/70 text-sm mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {detail.date}
                    </span>
                    {detail.time && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {detail.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(
                  detail.status
                )}`}
              >
                {getStatusLabel(detail.status)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

