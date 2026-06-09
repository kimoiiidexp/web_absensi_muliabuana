"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  LoaderCircle,
  MapPin,
  QrCode,
  RefreshCw,
  School,
  Users,
  XCircle,
} from "lucide-react";
import { apiUrl } from "@/lib/api";

interface GuruMapelKelas {
  ID: number;
  GuruID: number;
  KelasID: number;
  MapelID: number;
  KelasName: string;
  JurusanName: string;
  MapelName: string;
}

interface RawSession {
  ID?: number;
  KelasID?: number;
  MapelID?: number;
  QRToken?: string;
  ExpiredAt?: string;
  RadiusMeter?: number;
  IsClosed?: boolean;
  CreatedAt?: string;
  id?: number;
  kelas_id?: number;
  mapel_id?: number;
  kelas_name?: string;
  jurusan_name?: string;
  mapel_name?: string;
  qr_token?: string;
  expired_at?: string;
  radius_meter?: number;
  is_closed?: boolean;
  created_at?: string;
}

interface AbsensiSession {
  id: number;
  kelasId: number;
  mapelId: number;
  kelasName?: string;
  jurusanName?: string;
  mapelName?: string;
  qrToken: string;
  expiredAt: string;
  radiusMeter: number;
  isClosed: boolean;
  createdAt?: string;
}

interface LaporanItem {
  id: number;
  siswa_id: number;
  nama: string;
  waktu_absen: string;
  status: string;
}

interface Summary {
  total_siswa: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
}

function normalizeSession(data: RawSession): AbsensiSession {
  return {
    id: Number(data.ID ?? data.id),
    kelasId: Number(data.KelasID ?? data.kelas_id),
    mapelId: Number(data.MapelID ?? data.mapel_id),
    kelasName: data.kelas_name,
    jurusanName: data.jurusan_name,
    mapelName: data.mapel_name,
    qrToken: String(data.QRToken ?? data.qr_token ?? ""),
    expiredAt: String(data.ExpiredAt ?? data.expired_at ?? ""),
    radiusMeter: Number(data.RadiusMeter ?? data.radius_meter ?? 100),
    isClosed: Boolean(data.IsClosed ?? data.is_closed),
    createdAt: String(data.CreatedAt ?? data.created_at ?? ""),
  };
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function KehadiranSiswaPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [assignments, setAssignments] = useState<GuruMapelKelas[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [sessions, setSessions] = useState<AbsensiSession[]>([]);
  const [activeSession, setActiveSession] = useState<AbsensiSession | null>(null);
  const [qrImage, setQrImage] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [laporan, setLaporan] = useState<LaporanItem[]>([]);
  const [remainingMs, setRemainingMs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [closing, setClosing] = useState(false);
  const [message, setMessage] = useState("");

  const selectedAssignment = useMemo(
    () => assignments.find((item) => String(item.ID) === selectedAssignmentId),
    [assignments, selectedAssignmentId]
  );

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return null;
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  }, [router]);

  const fetchAssignments = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) return;

    const res = await fetch(apiUrl("/api/guru/mapel-kelas"), { headers });
    if (!res.ok) {
      throw new Error("Gagal mengambil daftar kelas dan mapel");
    }

    const data = (await res.json()) as GuruMapelKelas[];
    setAssignments(data || []);
    if (!selectedAssignmentId && data?.length) {
      setSelectedAssignmentId(String(data[0].ID));
    }
  }, [authHeaders, selectedAssignmentId]);

  const fetchSessions = useCallback(async () => {
    const headers = authHeaders();
    if (!headers) return;

    const res = await fetch(apiUrl("/api/guru/sessions"), { headers });
    if (!res.ok) return;

    const data = (await res.json()) as RawSession[];
    setSessions((data || []).map(normalizeSession));
  }, [authHeaders]);

  const refreshSessionData = useCallback(
    async (sessionId: number) => {
      const headers = authHeaders();
      if (!headers) return;

      const [summaryRes, laporanRes] = await Promise.all([
        fetch(apiUrl(`/api/guru/session/${sessionId}/summary`), { headers }),
        fetch(apiUrl(`/api/guru/session/${sessionId}/laporan`), { headers }),
      ]);

      if (summaryRes.ok) {
        setSummary(await summaryRes.json());
      }

      if (laporanRes.ok) {
  const data = await laporanRes.json();

  console.log("LAPORAN RESPONSE =", data);
  console.log("IS ARRAY =", Array.isArray(data));

  setLaporan(Array.isArray(data) ? data : []);
}

      await fetchSessions();
    },
    [authHeaders, fetchSessions]
  );

  const renderQr = useCallback(async (token: string) => {
    const url = await QRCode.toDataURL(token, {
      width: 320,
      margin: 2,
      color: {
        dark: "#230d7d",
        light: "#ffffff",
      },
    });
    setQrImage(url);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchAssignments(), fetchSessions()]);
      } catch (error) {
        console.error(error);
        setMessage("Gagal memuat data guru");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [mounted, fetchAssignments, fetchSessions]);

  useEffect(() => {
    if (!activeSession?.expiredAt) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      setRemainingMs(new Date(activeSession.expiredAt).getTime() - Date.now());
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [activeSession]);

  useEffect(() => {
    if (!activeSession) return;

    const timer = window.setInterval(() => {
      refreshSessionData(activeSession.id);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [activeSession, refreshSessionData]);

  const createSession = async () => {
    if (!selectedAssignment) {
      setMessage("Pilih kelas dan mapel terlebih dahulu");
      return;
    }

    if (!navigator.geolocation) {
      setMessage("Browser tidak mendukung lokasi");
      return;
    }

    const headers = authHeaders();
    if (!headers) return;

    try {
      setCreating(true);
      setMessage("");

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const res = await fetch(apiUrl("/api/guru/create-session"), {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kelas_id: selectedAssignment.KelasID,
          mapel_id: selectedAssignment.MapelID,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(typeof data === "string" ? data : "Gagal membuat QR");
        return;
      }

      const session = normalizeSession(data);
      session.kelasName = selectedAssignment.KelasName;
      session.jurusanName = selectedAssignment.JurusanName;
      session.mapelName = selectedAssignment.MapelName;

      setActiveSession(session);
      setSummary(null);
      setLaporan([]);
      await renderQr(session.qrToken);
      await refreshSessionData(session.id);
      setMessage("QR absensi berhasil dibuat");
    } catch (error) {
      console.error(error);
      setMessage("Gagal mengambil lokasi atau membuat QR");
    } finally {
      setCreating(false);
    }
  };

  const closeSession = async () => {
    if (!activeSession) return;

    const headers = authHeaders();
    if (!headers) return;

    try {
      setClosing(true);
      const res = await fetch(apiUrl(`/api/guru/session/${activeSession.id}/generate-alpa`), {
        method: "POST",
        headers,
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(typeof data === "string" ? data : "Gagal menutup absensi");
        return;
      }

      setActiveSession({ ...activeSession, isClosed: true });
      setMessage("Absensi ditutup dan alpa sudah dibuat");
      await refreshSessionData(activeSession.id);
    } catch (error) {
      console.error(error);
      setMessage("Gagal menutup absensi");
    } finally {
      setClosing(false);
    }
  };

  const openExistingSession = async (session: AbsensiSession) => {
    setActiveSession(session);
    setSummary(null);
    setLaporan([]);
    await renderQr(session.qrToken);
    await refreshSessionData(session.id);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef5fb]">
        <LoaderCircle className="animate-spin text-[#4187b3]" size={42} />
      </div>
    );
  }

  const isExpired = activeSession ? remainingMs <= 0 : false;
  const canClose = Boolean(activeSession && isExpired && !activeSession.isClosed);

  return (
    <div className="min-h-screen bg-[#eef5fb] p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-[48px] h-[48px] rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#4187b3]/10 text-[#230d7d] hover:shadow-md transition"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#230d7d]">Kehadiran Siswa</h1>
            <p className="text-[#230d7d]/70 mt-1">Buat QR dinamis untuk absensi kelas</p>
          </div>
        </div>
        <button
          onClick={() => activeSession && refreshSessionData(activeSession.id)}
          disabled={!activeSession}
          className="h-[46px] px-5 rounded-xl bg-white border border-[#4187b3]/10 text-[#230d7d] flex items-center gap-2 disabled:opacity-50 hover:shadow-md transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-xl bg-white border border-[#4187b3]/10 p-4 text-[#230d7d]">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-[20px] p-6 border border-[#4187b3]/10 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <School className="text-[#4187b3]" size={24} />
              <h2 className="text-xl font-bold text-[#230d7d]">Mulai Absensi</h2>
            </div>

            <label className="block text-sm font-medium text-[#230d7d]/70 mb-2">
              Kelas dan mata pelajaran
            </label>
            <select
              value={selectedAssignmentId}
              onChange={(event) => setSelectedAssignmentId(event.target.value)}
              className="w-full h-[50px] rounded-xl border border-[#4187b3]/20 px-4 text-[#230d7d] bg-white focus:outline-none focus:ring-2 focus:ring-[#4187b3]"
            >
              {assignments.length === 0 ? (
                <option value="">Belum ada mapping kelas</option>
              ) : (
                assignments.map((item) => (
                  <option key={item.ID} value={item.ID}>
                    {item.KelasName} - {item.MapelName}
                  </option>
                ))
              )}
            </select>

            {selectedAssignment && (
              <div className="mt-4 rounded-xl bg-[#eef5fb] p-4 text-sm text-[#230d7d]/80 space-y-2">
                <p>Jurusan: {selectedAssignment.JurusanName || "-"}</p>
                <p>Kelas: {selectedAssignment.KelasName}</p>
                <p>Mapel: {selectedAssignment.MapelName}</p>
              </div>
            )}

            <button
              onClick={createSession}
              disabled={creating || assignments.length === 0}
              className="mt-5 w-full h-[52px] rounded-xl bg-[#4187b3] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition"
            >
              {creating ? <LoaderCircle className="animate-spin" size={20} /> : <QrCode size={20} />}
              Buat QR Absensi
            </button>
          </div>

          <div className="bg-white rounded-[20px] p-6 border border-[#4187b3]/10 shadow-sm">
            <h2 className="text-xl font-bold text-[#230d7d] mb-4">Session Terakhir</h2>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-[#230d7d]/60">Belum ada session absensi.</p>
              ) : (
                sessions.slice(0, 5).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => openExistingSession(session)}
                    className="w-full text-left rounded-xl border border-[#4187b3]/10 p-4 hover:bg-[#eef5fb] transition"
                  >
                    <p className="font-semibold text-[#230d7d]">
                      {session.kelasName || `Kelas #${session.kelasId}`} - {session.mapelName || `Mapel #${session.mapelId}`}
                    </p>
                    <p className="text-sm text-[#230d7d]/60 mt-1">
                      {session.isClosed ? "Ditutup" : "Aktif/menunggu ditutup"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[20px] p-6 border border-[#4187b3]/10 shadow-sm">
            {!activeSession ? (
              <div className="min-h-[360px] flex flex-col items-center justify-center text-center text-[#230d7d]/60">
                <QrCode size={72} className="mb-4 text-[#4187b3]/50" />
                <p className="text-lg font-medium">Belum ada QR aktif</p>
                <p className="mt-2">Pilih kelas dan buat QR untuk mulai absensi siswa.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-[320px] h-[320px] rounded-xl border border-[#4187b3]/10 flex items-center justify-center bg-white">
                    {qrImage ? (
                      <img src={qrImage} alt="QR absensi siswa" className="w-[300px] h-[300px]" />
                    ) : (
                      <LoaderCircle className="animate-spin text-[#4187b3]" size={42} />
                    )}
                  </div>
                  <p className="mt-4 text-center text-sm text-[#230d7d]/60 break-all">
                    Token: {activeSession.qrToken}
                  </p>
                </div>

                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-[#230d7d]">
                        {activeSession.kelasName || `Kelas #${activeSession.kelasId}`}
                      </h2>
                      <p className="text-[#230d7d]/70 mt-1">
                        {activeSession.mapelName || `Mapel #${activeSession.mapelId}`}
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        activeSession.isClosed
                          ? "bg-gray-100 text-gray-700"
                          : isExpired
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {activeSession.isClosed ? "Ditutup" : isExpired ? "Expired" : "Aktif"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                    <InfoBox icon={<Clock size={22} />} label="Sisa waktu" value={formatDuration(remainingMs)} />
                    <InfoBox icon={<MapPin size={22} />} label="Radius" value={`${activeSession.radiusMeter} m`} />
                    <InfoBox icon={<Users size={22} />} label="Total siswa" value={String(summary?.total_siswa ?? 0)} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    <StatusBox label="Hadir" value={summary?.hadir ?? 0} tone="green" />
                    <StatusBox label="Izin" value={summary?.izin ?? 0} tone="yellow" />
                    <StatusBox label="Sakit" value={summary?.sakit ?? 0} tone="blue" />
                    <StatusBox label="Alpa" value={summary?.alpa ?? 0} tone="red" />
                  </div>

                  <button
                    onClick={closeSession}
                    disabled={!canClose || closing}
                    className="mt-6 h-[50px] px-5 rounded-xl bg-red-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition"
                  >
                    {closing ? <LoaderCircle className="animate-spin" size={20} /> : <XCircle size={20} />}
                    Tutup Absensi dan Buat Alpa
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[20px] p-6 border border-[#4187b3]/10 shadow-sm">
            <h2 className="text-xl font-bold text-[#230d7d] mb-4">Daftar Absensi</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#4187b3]/10">
                    <th className="py-3 px-4 text-left text-[#230d7d]">Nama</th>
                    <th className="py-3 px-4 text-left text-[#230d7d]">Waktu</th>
                    <th className="py-3 px-4 text-left text-[#230d7d]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {laporan.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-10 text-center text-[#230d7d]/60">
                        Belum ada siswa yang absen.
                      </td>
                    </tr>
                  ) : (
                    laporan.map((item) => (
                      <tr key={item.id} className="border-b border-[#4187b3]/5">
                        <td className="py-3 px-4 text-[#230d7d] font-medium">{item.nama}</td>
                        <td className="py-3 px-4 text-[#230d7d]/70">
                          {new Date(item.waktu_absen).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                            <CheckCircle size={14} />
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#eef5fb] p-4 text-[#230d7d]">
      <div className="flex items-center gap-2 text-[#4187b3]">{icon}</div>
      <p className="text-sm text-[#230d7d]/60 mt-3">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function StatusBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "yellow" | "blue" | "red";
}) {
  const colorClass = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
  }[tone];

  return (
    <div className={`rounded-xl p-4 ${colorClass}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
