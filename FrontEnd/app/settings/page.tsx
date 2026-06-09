"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Lock, LogOut, AlertCircle, CheckCircle } from "lucide-react";
import AppShell from "@/components/AppShell";
import { authFetch, parseJson, logout } from "@/lib/auth";

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await authFetch("/api/profile").then((r) => parseJson<{ phone: string }>(r));
      setPhone(data.phone || "");
      localStorage.setItem("phone", data.phone || "");
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setMessage({ type: "error", text: "Nomor telepon tidak boleh kosong" });
      return;
    }

    setLoading(true);
    try {
      await authFetch("/api/profile/phone", {
        method: "PUT",
        body: JSON.stringify({ phone }),
      }).then((r) => parseJson(r));
      localStorage.setItem("phone", phone);
      setMessage({ type: "success", text: "Nomor telepon berhasil diperbarui" });
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef5fb]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]"></div>
      </div>
    );
  }

  return (
    <AppShell title="Pengaturan">
      {/* MESSAGE */}
      {message && (
        <div
          className={`rounded-[15px] p-4 mb-8 flex items-center gap-3 ${
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

      {/* SETTINGS SECTIONS */}
      <div className="space-y-6">
        {/* PHONE SETTINGS */}
        <div className="bg-white rounded-[20px] p-8 border border-[#4187b3]/10 shadow-md">
          <h2 className="text-xl font-bold text-[#230d7d] mb-6">
            Informasi Kontak
          </h2>

          <form onSubmit={handleUpdatePhone} className="space-y-6">
            <div>
              <label className="block text-[#230d7d] font-medium mb-2">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Masukkan nomor telepon"
                className="w-full px-4 py-3 rounded-xl border border-[#4187b3]/10 text-[#230d7d] placeholder-[#230d7d]/50 focus:outline-none focus:ring-2 focus:ring-[#4187b3]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-[#4187b3] text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>

        {/* NOTIFICATION SETTINGS */}
        <div className="bg-white rounded-[20px] p-8 border border-[#4187b3]/10 shadow-md">
          <h2 className="text-xl font-bold text-[#230d7d] mb-6 flex items-center gap-3">
            <Bell size={24} className="text-[#4187b3]" />
            Notifikasi
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#eef5fb]">
              <div>
                <p className="font-medium text-[#230d7d]">
                  Notifikasi Absensi
                </p>
                <p className="text-[#230d7d]/70 text-sm">
                  Terima notifikasi saat ada session absensi baru
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-6 h-6 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* SECURITY SETTINGS */}
        <div className="bg-white rounded-[20px] p-8 border border-[#4187b3]/10 shadow-md">
          <h2 className="text-xl font-bold text-[#230d7d] mb-6 flex items-center gap-3">
            <Lock size={24} className="text-[#4187b3]" />
            Keamanan
          </h2>

          <button className="w-full px-6 py-3 rounded-xl border border-[#4187b3]/10 text-[#230d7d] font-medium hover:shadow-md transition">
            Ubah Password
          </button>
        </div>

        {/* LOGOUT */}
        <div className="bg-white rounded-[20px] p-8 border border-red-200 shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-3">
            <LogOut size={24} />
            Keluar
          </h2>

          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 rounded-xl bg-red-500 text-white font-medium hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </AppShell>
  );
}

