"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, AlertCircle, CheckCircle } from "lucide-react";

interface IzinRequest {
  id: number;
  date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function IzinPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [requests, setRequests] = useState<IzinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchIzin();
  }, []);

  const fetchIzin = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/siswa/izin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(data || []);
      }
    } catch (error) {
      console.error("Error fetching izin:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.reason) {
      setMessage({ type: "error", text: "Semua field harus diisi" });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/siswa/izin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setMessage({ type: "success", text: "Izin berhasil diajukan" });
        setFormData({ date: "", reason: "" });
        setShowForm(false);
        fetchIzin();
      } else {
        setMessage({ type: "error", text: "Gagal mengajukan izin" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      case "pending":
        return "Menunggu";
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-[48px] h-[48px] rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#4187b3]/10 text-[#230d7d] hover:shadow-md transition"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-3xl font-bold text-[#230d7d]">Izin Siswa</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 rounded-xl bg-[#4187b3] text-white font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Ajukan Izin
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white rounded-[20px] p-8 border border-[#4187b3]/10 shadow-md mb-8">
          <h2 className="text-xl font-bold text-[#230d7d] mb-6">
            Ajukan Izin Baru
          </h2>

          {message && (
            <div
              className={`rounded-[15px] p-4 mb-6 flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={24} />
              ) : (
                <AlertCircle size={24} />
              )}
              <p className="font-medium">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#230d7d] font-medium mb-2">
                Tanggal Izin
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-[#4187b3]/10 text-[#230d7d] focus:outline-none focus:ring-2 focus:ring-[#4187b3]"
              />
            </div>

            <div>
              <label className="block text-[#230d7d] font-medium mb-2">
                Alasan Izin
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                rows={4}
                placeholder="Jelaskan alasan izin Anda..."
                className="w-full px-4 py-3 rounded-xl border border-[#4187b3]/10 text-[#230d7d] placeholder-[#230d7d]/50 focus:outline-none focus:ring-2 focus:ring-[#4187b3]"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 rounded-xl bg-[#4187b3] text-white font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? "Mengirim..." : "Ajukan"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-white text-[#230d7d] font-medium border border-[#4187b3]/10 hover:shadow-md transition"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REQUESTS LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-[15px] p-12 text-center border border-[#4187b3]/10">
            <p className="text-[#230d7d]/70">Belum ada pengajuan izin</p>
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-[15px] p-6 border border-[#4187b3]/10 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#230d7d] text-lg mb-2">
                    {request.date}
                  </h3>
                  <p className="text-[#230d7d]/70 mb-3">{request.reason}</p>
                  <p className="text-[#230d7d]/50 text-sm">
                    Diajukan: {request.createdAt}
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${getStatusColor(
                    request.status
                  )}`}
                >
                  {getStatusLabel(request.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

