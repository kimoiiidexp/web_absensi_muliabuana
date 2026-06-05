"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";

interface AbsenRecord {
  id: number;
  date: string;
  time: string;
  status: "hadir" | "terlambat" | "izin" | "sakit" | "alpa";
  subject: string;
  class: string;
  location?: string;
}

export default function RiwayatAbsenPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState<AbsenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "hadir" | "terlambat" | "izin" | "sakit" | "alpa">("all");

  useEffect(() => {
    setMounted(true);
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/siswa/riwayat`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecords(data || []);
      }
    } catch (error) {
      console.error("Error fetching riwayat:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(
    (r) => filterStatus === "all" || r.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hadir":
        return "bg-green-100 text-green-700";
      case "izin":
        return "bg-yellow-100 text-yellow-700";
      case "sakit":
        return "bg-blue-100 text-blue-700";
      case "terlambat":
        return "bg-orange-100 text-orange-700";
      case "alpa":
        return "bg-red-100 text-red-700";
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
      case "sakit":
        return "Sakit";
      case "terlambat":
        return "Terlambat";
      case "alpa":
        return "Alpa";
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
        <h1 className="text-3xl font-bold text-[#230d7d]">Riwayat Absen</h1>
      </div>

      {/* FILTER */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {["all", "hadir", "terlambat", "izin", "sakit", "alpa"].map((status) => (
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

      {/* RECORDS */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-[15px] p-12 text-center border border-[#4187b3]/10">
            <p className="text-[#230d7d]/70">Tidak ada riwayat absen</p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-[15px] p-6 border border-[#4187b3]/10 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#230d7d] text-lg mb-3">
                    {record.subject}
                  </h3>

                  <div className="space-y-2 text-[#230d7d]/70 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{record.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{record.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Kelas:</span>
                      <span>{record.class}</span>
                    </div>
                    {record.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{record.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${getStatusColor(
                    record.status
                  )}`}
                >
                  {getStatusLabel(record.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

