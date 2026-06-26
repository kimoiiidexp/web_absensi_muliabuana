"use client";

import { useState, useEffect } from "react";
import { 
  QrCode, 
  MapPin, 
  Calendar, 
  Megaphone, 
  Users, 
  GraduationCap, 
  School, 
  ArrowRight,
  Menu,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Compass,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  
  // Geofencing Simulation State
  const [latInput, setLatInput] = useState("-6.34294");
  const [lngInput, setLngInput] = useState("106.69268");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    status: "success" | "outside" | "idle";
    distance: number;
    message: string;
  }>({ status: "idle", distance: 0, message: "" });

  const schoolCoords = { lat: -6.2378, lng: 106.7562 }; // Titik Utama SMK Mulia Buana

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setCurrentDate(now.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateGeofencing = () => {
    setIsSimulating(true);
    setSimulationResult({ status: "idle", distance: 0, message: "" });

    setTimeout(() => {
      const lat = parseFloat(latInput);
      const lng = parseFloat(lngInput);

      if (isNaN(lat) || isNaN(lng)) {
        setSimulationResult({
          status: "outside",
          distance: 0,
          message: "Format koordinasi tidak valid. Gunakan angka desimal."
        });
        setIsSimulating(false);
        return;
      }

      // Hitung jarak Haversine (meter)
      const R = 6371e3;
      const phi1 = (schoolCoords.lat * Math.PI) / 180;
      const phi2 = (lat * Math.PI) / 180;
      const deltaPhi = ((lat - schoolCoords.lat) * Math.PI) / 180;
      const deltaLambda = ((lng - schoolCoords.lng) * Math.PI) / 180;

      const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = Math.round(R * c);

      const radiusLimit = 150; // Radius batas 150 meter

      if (distance <= radiusLimit) {
        setSimulationResult({
          status: "success",
          distance,
          message: `Berhasil! Anda berada dalam jangkauan radar sekolah (${distance} meter). Absensi dapat dilakukan.`
        });
      } else {
        setSimulationResult({
          status: "outside",
          distance,
          message: `Gagal! Anda berada di luar radius sekolah (${distance} meter). Batas maksimal radius adalah ${radiusLimit} meter.`
        });
      }
      setIsSimulating(false);
    }, 800);
  };

  const handleUseCurrentLocation = () => {
    setIsSimulating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatInput(position.coords.latitude.toFixed(6));
          setLngInput(position.coords.longitude.toFixed(6));
          
          setTimeout(() => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const R = 6371e3;
            const phi1 = (schoolCoords.lat * Math.PI) / 180;
            const phi2 = (lat * Math.PI) / 180;
            const deltaPhi = ((lat - schoolCoords.lat) * Math.PI) / 180;
            const deltaLambda = ((lng - schoolCoords.lng) * Math.PI) / 180;
            const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = Math.round(R * c);
            const radiusLimit = 150;

            if (distance <= radiusLimit) {
              setSimulationResult({
                status: "success",
                distance,
                message: `Berhasil! GPS mendeteksi Anda pada jarak ${distance} meter dari koordinat SMK Mulia Buana.`
              });
            } else {
              setSimulationResult({
                status: "outside",
                distance,
                message: `Diluar Area! Anda berada sekitar ${distance} meter dari sekolah, di luar batas aman absensi.`
              });
            }
            setIsSimulating(false);
          }, 800);
        },
        () => {
          setSimulationResult({
            status: "outside",
            distance: 350,
            message: "Akses GPS ditolak atau tidak didukung. Silakan gunakan simulasi koordinat secara manual."
          });
          setIsSimulating(false);
        }
      );
    } else {
      setSimulationResult({
        status: "outside",
        distance: 0,
        message: "Peramban ini tidak mendukung layanan penentuan lokasi GPS."
      });
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-[#4187b3]/20 selection:text-[#4187b3]">
      {/* Navbar Grid Layout */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4187b3] text-white shadow-sm shadow-[#4187b3]/20">
              <School className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                SMK Mulia Buana
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#4187b3] tracking-wider block">
                Presensi Online
              </span>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#fitur" className="text-sm font-medium text-slate-600 hover:text-[#4187b3] transition-colors">
              Fitur Utama
            </a>
            <a href="#statistik" className="text-sm font-medium text-slate-600 hover:text-[#4187b3] transition-colors">
              Keunggulan
            </a>
            <a href="#demo-geofence" className="text-sm font-medium text-slate-600 hover:text-[#4187b3] transition-colors">
              Simulasi Koordinat
            </a>
            <a 
              href="/login" 
              className="inline-flex items-center justify-center rounded-lg bg-[#4187b3] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#4187b3]/15 hover:bg-[#346e92] transition-all"
            >
              Masuk Sistem
            </a>
          </nav>

          {/* Mobile Menu Icon */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 md:hidden transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white p-4 shadow-lg md:hidden">
            <div className="flex flex-col gap-3">
              <a 
                href="#fitur" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#4187b3] transition-colors"
              >
                Fitur Utama
              </a>
              <a 
                href="#statistik" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#4187b3] transition-colors"
              >
                Keunggulan
              </a>
              <a 
                href="#demo-geofence" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#4187b3] transition-colors"
              >
                Simulasi Koordinat
              </a>
              <hr className="my-1 border-slate-100" />
              <a 
                href="/login" 
                className="flex items-center justify-center rounded-lg bg-[#4187b3] py-2.5 text-center text-sm font-semibold text-white hover:bg-[#346e92] transition-colors"
              >
                Masuk Sistem
              </a>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#f0f7fb]/70 via-white to-slate-50 py-16 sm:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(65,135,179,0.08),transparent_45%)]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              
              {/* Hero Left Content */}
              <div className="text-center lg:col-span-7 lg:text-left">
                <div className="inline-flex items-center gap-2.5 rounded-full bg-[#f0f7fb] px-3.5 py-1.5 text-xs font-semibold text-[#4187b3] ring-1 ring-[#4187b3]/10">
                  <span className="flex h-2 w-2 rounded-full bg-[#4187b3] animate-pulse" />
                  Sistem Informasi Presensi Digital Terintegrasi
                </div>
                <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                  Sistem Absensi Online <br />
                  <span className="text-[#4187b3]">SMK Mulia Buana</span>
                </h1>
                <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
                  Revolusi pencatatan kehadiran civitas akademika menggunakan verifikasi foto nirkabel, pemindaian dinamis <span className="font-semibold text-slate-800">QR Code</span>, serta pembatasan wilayah presensi berbasis lokasi <span className="font-semibold text-slate-800">Geofencing</span> yang aman dan akurat.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                  <a 
                    href="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4187b3] px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-[#4187b3]/20 hover:bg-[#346e92] hover:shadow-lg sm:w-auto transition-all"
                  >
                    Masuk Sistem
                    <ArrowRight className="h-5 w-5" />
                  </a>
                  <a 
                    href="#fitur"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-600 hover:bg-slate-50 sm:w-auto transition-all"
                  >
                    Lihat Panduan
                  </a>
                </div>
              </div>

              {/* Hero Right Visual Mockup Card */}
              <div className="mx-auto w-full max-w-md lg:col-span-5">
                <div className="relative rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-slate-100/80">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <span className="rounded bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-medium text-slate-500">
                      LIVE RADAR
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <span className="mb-1 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Waktu Presensi Hari Ini
                    </span>
                    <div className="font-display font-bold leading-none tracking-tight text-[#4187b3] text-3xl sm:text-4xl min-h-[40px]">
                      {currentTime || "07:00:00"}
                    </div>
                    <span className="mt-1.5 text-xs text-slate-400">
                      {currentDate || "Senin, 22 Juni 2026"}
                    </span>

                    {/* QR Scanner Frame simulation */}
                    <div className="group relative my-6 flex h-44 w-44 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 shadow-inner overflow-hidden">
                      <div className="absolute inset-0 bg-[#4187b3]/10 opacity-70" />
                      
                      {/* Scanner Line animation */}
                      <div className="absolute left-0 right-0 h-[2px] bg-[#4187b3] animate-[bounce_4s_infinite] shadow-sm shadow-[#4187b3]/70" />
                      
                      {/* Corner Accents */}
                      <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-[#4187b3]" />
                      <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-[#4187b3]" />
                      <div className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[#4187b3]" />
                      <div className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[#4187b3]" />

                      <QrCode className="relative h-20 w-20 text-slate-800 transition-transform group-hover:scale-105 duration-300" />
                    </div>

                    {/* Coordinates Status Mock */}
                    <div className="w-full rounded-xl bg-emerald-50/70 p-3 sm:p-4 text-left border border-emerald-100">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-800">Geofence Terkunci</p>
                          <p className="mt-0.5 text-[11px] text-emerald-700 leading-normal">
                             GPS Anda berada di dalam radius diperbolehkan (Area Utama SMK Mulia Buana).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="fitur" className="py-20 sm:py-24 bg-white relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Keandalan Sistem Absensi Digital
              </h2>
              <p className="mt-4 text-base text-slate-500 max-w-lg mx-auto">
                Didesain khusus untuk memenuhi transparansi, keamanan, dan efisiensi pelaporan kehadiran harian siswa dan guru.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              
              {/* Feature 1: QR Code */}
              <div className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-[#4187b3]/40 hover:shadow-md transition-all duration-300">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f7fb] text-[#4187b3] group-hover:bg-[#4187b3] group-hover:text-white transition-all duration-300">
                  <QrCode className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Absensi QR Code
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  Guru dan siswa cukup melakukan pemindaian barcode dinamis instan melalui HP sebelum mengawali sesi belajar.
                </p>
              </div>

              {/* Feature 2: Geofencing Lokasi */}
              <div className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-[#4187b3]/40 hover:shadow-md transition-all duration-300">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f7fb] text-[#4187b3] group-hover:bg-[#4187b3] group-hover:text-white transition-all duration-300">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Geofencing Lokasi
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  Membatasi radius pengiriman absensi. Fitur penentu wilayah menjamin pengguna berada tepat di area area sekolah.
                </p>
              </div>

              {/* Feature 3: Rekap Kehadiran */}
              <div className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-[#4187b3]/40 hover:shadow-md transition-all duration-300">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f7fb] text-[#4187b3] group-hover:bg-[#4187b3] group-hover:text-white transition-all duration-300">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Rekap Kehadiran
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  Laporan berkala otomatis yang terstruktur, rapi, memudahkan wali kelas mengevaluasi keaktifan siswa.
                </p>
              </div>

              {/* Feature 4: Pengumuman Sekolah */}
              <div className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-[#4187b3]/40 hover:shadow-md transition-all duration-300">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f7fb] text-[#4187b3] group-hover:bg-[#4187b3] group-hover:text-white transition-all duration-300">
                  <Megaphone className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Pengumuman Sekolah
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  Menyalurkan pengumuman penting, jadwal ujian, rilis wali, dan kalender kegiatan resmi langsung ke dasbor user.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* Live Interactive Geofence Testing Sandbox Section */}
        <section id="demo-geofence" className="py-20 sm:py-24 bg-slate-50 border-t border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Simulasi Radar Geofencing Sekolah
              </h2>
              <p className="mt-4 text-base text-slate-500 max-w-xl mx-auto">
                Uji langsung kesesuaian lokasi Anda sekarang menggunakan koordinat GPS fiktif atau deteksi GPS langsung untuk melihat status kelaikan pengiriman absen.
              </p>
            </div>

            <div className="mt-12 mx-auto max-w-2xl rounded-2xl bg-white border border-slate-200/70 p-6 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Latitude (Garis Lintang)
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={latInput}
                      onChange={(e) => setLatInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-[#4187b3] focus:bg-white focus:outline-none transition-all"
                      placeholder="-6.2378"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Longitude (Garis Bujur)
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={lngInput}
                      onChange={(e) => setLngInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-[#4187b3] focus:bg-white focus:outline-none transition-all"
                      placeholder="106.7562"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-slate-400 bg-slate-50 rounded-lg p-3 flex flex-wrap gap-x-4 gap-y-1">
                <span>📍 <b>Titik Sekolah:</b> Lat -6.2378, Lng 106.7562</span>
                <span>💡 <b>Saran Uji Luar Area:</b> Set Lat -6.2410, Lng 106.7510</span>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSimulateGeofencing}
                  disabled={isSimulating}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#4187b3] py-3 text-sm font-semibold text-white hover:bg-[#346e92] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSimulating ? "Menghitung Jarak..." : "Uji Hitung Koordinat"}
                </button>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isSimulating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Compass className={`h-4.5 w-4.5 text-[#4187b3] ${isSimulating ? 'animate-spin' : ''}`} />
                  Deteksi GPS Riil
                </button>
              </div>

              {simulationResult.status !== "idle" && (
                <div className={`mt-6 rounded-xl border p-4.5 transition-all ${
                  simulationResult.status === "success" 
                    ? "bg-emerald-50/70 border-emerald-100 text-emerald-800" 
                    : "bg-red-50/70 border-red-100 text-red-800"
                }`}>
                  <div className="flex gap-3">
                    {simulationResult.status === "success" ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-bold">
                        {simulationResult.status === "success" ? "Dalam Jangkauan Absen" : "Di Luar Jangkauan Absen"}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed opacity-90">
                        {simulationResult.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section id="statistik" className="py-20 sm:py-24 bg-white relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              
              <div className="lg:col-span-4">
                <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Data & Statistik Kehadiran Sekolah
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-500">
                  SMK Mulia Buana terus meningkatkan mutu belajar melalui penegakan kedisiplinan berbasis teknologi. Seluruh data terekam transparan di sistem.
                </p>
                <div className="mt-6 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-[#4187b3]" />
                    Sistem beroperasi penuh 24 jam
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-[#4187b3]" />
                    Tingkat akurasi GPS mencapai 99.8%
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-[#4187b3]" />
                    Otomatisasi pengiriman laporan harian
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="grid gap-6 sm:grid-cols-3">
                  
                  {/* Stat Card 1: Guru */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center shadow-inner hover:bg-slate-50 transition-colors">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#4187b3]/10 text-[#4187b3]">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <div className="font-display text-4xl font-extrabold text-slate-900">76</div>
                    <div className="mt-1 text-sm font-bold text-slate-800">Guru & Staff</div>
                    <p className="mt-2 text-xs text-slate-400">Telah terintegrasi dengan akses biometrik dan QR.</p>
                  </div>

                  {/* Stat Card 2: Siswa */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center shadow-inner hover:bg-slate-50 transition-colors">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#4187b3]/10 text-[#4187b3]">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="font-display text-4xl font-extrabold text-slate-900">1.240</div>
                    <div className="mt-1 text-sm font-bold text-slate-800">Siswa Aktif</div>
                    <p className="mt-2 text-xs text-slate-400">Pembelajaran teori & praktik lintas jurusan.</p>
                  </div>

                  {/* Stat Card 3: Kelas */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center shadow-inner hover:bg-slate-50 transition-colors">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#4187b3]/10 text-[#4187b3]">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="font-display text-4xl font-extrabold text-slate-900">36</div>
                    <div className="mt-1 text-sm font-bold text-slate-800">Ruang Kelas</div>
                    <p className="mt-2 text-xs text-slate-400">Fasilitas pendukung belajar ber-AC & multimedia.</p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Help Center Info Card Bar */}
        <section className="bg-[#4187b3] py-12 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div>
                <h3 className="font-display text-xl font-bold">
                  Mengalami kendala teknis saat melakukan absensi?
                </h3>
                <p className="mt-1 text-sm text-[#f0f7fb]/95">
                  Hubungi tim IT Helpdesk SMK Mulia Buana untuk pengaturan ulang device, reset QR, atau perizinan dispensasi GPS.
                </p>
              </div>
              <a 
                href="mailto:it@smkmuliabuana.sch.id" 
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#4187b3] shadow hover:bg-[#f0f7fb] active:scale-95 transition-all shrink-0"
              >
                Hubungi Support IT
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-100 py-12 text-slate-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#4187b3] text-white">
                <School className="h-4 w-4" />
              </div>
              <span className="font-display text-sm font-bold text-slate-900">
                SMK Mulia Buana
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
              <span>Alamat: Jl. Raya Mulia No. 12, Buana</span>
              <span>•</span>
              <span>Surel: info@smkmuliabuana.sch.id</span>
            </div>
          </div>
          <hr className="my-8 border-slate-200" />
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} SMK Mulia Buana. Hak Cipta Dilindungi Undang-Undang.
            </p>
            <p>
              Sistem Informasi Absensi Digital v2.4.2
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}