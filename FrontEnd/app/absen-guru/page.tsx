"use client";

import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  TriangleAlert,
  User,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { apiUrl } from "@/lib/api";

export default function AbsenGuruPage() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streaming, setStreaming] = useState(false);

  const [loadingLokasi, setLoadingLokasi] = useState(false);

  const [status, setStatus] = useState<
    "idle" | "success" | "failed" | "already"
  >("idle");

  const [message, setMessage] = useState("");

  const [koordinat, setKoordinat] = useState("");

  // =========================
  // FIX HYDRATION
  // =========================

  const [name, setName] = useState("Guru");

  useEffect(() => {
    const localName = localStorage.getItem("name") || "Guru";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(localName);
  }, []);

  // =========================
  // CHECK IF ALREADY ABSENT
  // =========================
  useEffect(() => {
    const checkAbsen = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(apiUrl("/api/guru/cek-absen"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok && data.sudah_absen) {
          setStatus("already");
        }
      } catch (err) {
        console.log(err);
      }
    };

    checkAbsen();
  }, []);

  // If already absent, show already absent page
  if (status === "already") {
    return (
      <div className="min-h-screen bg-[#ececec] flex flex-col items-center justify-center px-8">
        <div className="bg-white rounded-[30px] p-10 shadow-md text-center w-full max-w-[420px]">
          <CheckCircle2
            size={120}
            className="text-[#22c55e] mx-auto animate-pulse"
          />

          <h1 className="mt-8 text-[34px] font-bold text-[#22c55e]">
            Anda Sudah Absen
          </h1>

          <p className="mt-4 text-[#111827]/70 text-lg">
            Absensi hari ini sudah tercatat.
          </p>

          <button
            onClick={() => router.push("/my-activity")}
            className="mt-10 w-full bg-[#6f95ef] rounded-2xl py-5 text-white text-[20px] font-semibold"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // START CAMERA
  // =========================
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 480,
          height: 480,
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStreaming(true);
    } catch (err) {
      console.log(err);
      alert("Camera tidak diizinkan");
    }
  };

  // =========================
  // STOP CAMERA
  // =========================
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    setStreaming(false);
  };

  // =========================
  // ABSEN
  // =========================
  const handleAbsen = async () => {
    try {
      setLoadingLokasi(true);
      setStatus("idle");

      // timeout max 3 detik
      const timeout = setTimeout(() => {
        setLoadingLokasi(false);
        alert("Lokasi terlalu lama didapatkan");
      }, 3000);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeout);

          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          setKoordinat(`@${latitude},${longitude}`);

          // =========================
          // AMBIL FOTO
          // =========================
          const canvas = canvasRef.current;
          const video = videoRef.current;

          if (!canvas || !video) {
            setLoadingLokasi(false);
            setStatus("failed");
            setMessage("Camera belum aktif");
            return;
          }

          const ctx = canvas.getContext("2d");

          // compress biar ringan
          canvas.width = 300;
          canvas.height = 300;

          ctx?.drawImage(video, 0, 0, 300, 300);

          const blob: Blob | null = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", 0.5)
          );

          if (!blob) {
            setLoadingLokasi(false);
            setStatus("failed");
            setMessage("Gagal mengambil foto");
            return;
          }

          // =========================
          // FORM DATA
          // =========================
          const formData = new FormData();
          formData.append("foto", blob, "absen.jpg");
          formData.append("latitude", latitude.toString());
          formData.append("longitude", longitude.toString());

          const token = localStorage.getItem("token");

          const res = await fetch(apiUrl("/api/guru/absen"), {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          const data = await res.json();

          setLoadingLokasi(false);

          // =========================
          // SUCCESS
          // =========================
          if (res.ok) {
            setStatus("success");
            setMessage("Absensi Berhasil");
            stopCamera();
            return;
          }

          // =========================
          // FAILED
          // =========================
          setStatus("failed");

          if (typeof data === "string") {
            if (data.includes("sudah")) {
              setMessage("Anda sudah melakukan absensi hari ini");
            } else if (data.includes("luar")) {
              setMessage("Anda berada di luar area sekolah");
            } else {
              setMessage(data);
            }
          } else if (data && data.message) {
            setMessage(data.message);
          } else {
            setMessage("Absensi gagal");
          }
        },
        (err) => {
          console.log(err);
          setLoadingLokasi(false);
          setStatus("failed");
          setMessage("Lokasi gagal didapatkan");
        },
        {
          enableHighAccuracy: false,
          timeout: 3000,
          maximumAge: 0,
        }
      );
    } catch (err) {
      console.log(err);
      setLoadingLokasi(false);
      setStatus("failed");
      setMessage("Server error");
    }
  };

  // =========================================================
  // SUCCESS PAGE
  // =========================================================
  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#ececec] flex flex-col items-center px-8">
        <div className="mt-24 flex flex-col items-center">
          <Image
            src="/logo-absen.png"
            alt="logo"
            width={120}
            height={120}
            className="w-[120px] h-auto"
          />

          <h1 className="mt-16 text-[34px] font-bold text-[#22c55e]">
            Absensi Berhasil
          </h1>

          <div className="mt-10 w-[320px] min-h-[280px] bg-[#ece8b8] rounded-3xl flex items-center justify-center px-8 py-10 text-center">
            <CheckCircle2
              size={180}
              className="text-[#22c55e] animate-pulse"
            />
          </div>

          <div className="mt-20 w-full space-y-5">
            <div className="w-full bg-[#6f95ef] rounded-2xl py-5 text-center text-white text-[18px] font-semibold">
              {koordinat}
            </div>

            <button
              onClick={() => router.push("/my-activity")}
              className="w-full bg-[#22c55e] rounded-2xl py-5 text-center text-white text-[20px] font-semibold"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // FAILED PAGE
  // =========================================================
  if (status === "failed") {
    return (
      <div className="min-h-screen bg-[#ececec] flex flex-col items-center px-8">
        <div className="mt-24 flex flex-col items-center">
          <Image
            src="/logo-absen.png"
            alt="logo"
            width={120}
            height={120}
            className="w-[120px] h-auto"
          />

          <h1 className="mt-16 text-[34px] font-bold text-red-500">
            Gagal
          </h1>

          <div className="mt-10 w-[320px] min-h-[280px] bg-[#ece8b8] rounded-3xl flex items-center justify-center px-8 py-10 text-center">
            <div className="text-center">
              <TriangleAlert
                size={90}
                className="text-red-500 mx-auto mb-5 animate-pulse shrink-0"
              />

              <h2 className="text-[24px] leading-relaxed font-bold text-red-500">
                {message}
              </h2>

              <p className="mt-4 text-[#444] text-[16px]">
                Silakan coba kembali atau pastikan lokasi Anda berada di area sekolah.
              </p>
            </div>
          </div>

          <div className="mt-24 w-full space-y-4">
            <button
              onClick={() => {
                setStatus("idle");
                startCamera();
              }}
              className="w-full bg-red-500 rounded-2xl py-5 text-center text-white text-[20px] font-semibold"
            >
              Coba Lagi
            </button>

            <button
              onClick={() => router.push("/my-activity")}
              className="w-full bg-[#6f95ef] rounded-2xl py-5 text-center text-white text-[20px] font-semibold"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================
  return (
    <div className="min-h-screen bg-[#ececec]">
      {/* HEADER */}
      <div className="bg-[#ece8b8] rounded-b-[24px] px-8 py-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-[45px] h-[45px] rounded-xl bg-white/70 flex items-center justify-center"
          >
            <ArrowLeft size={24} />
          </button>

          <button
            className="w-[45px] h-[45px] rounded-xl bg-white/70 flex items-center justify-center"
          >
            <User size={24} />
          </button>
        </div>

        <div className="mt-10">
          <h1 className="text-[34px] font-bold text-[#111827]">
            Selamat Pagi,
          </h1>

          <h2 className="text-[34px] font-bold text-[#111827]">
            {name}
          </h2>

          <p className="text-[18px] text-[#111827] mt-2">
            Tanggal : {new Date().toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>

      {/* BODY */}
      <div className="px-8 pt-10 pb-20 flex flex-col items-center">
        <h1 className="text-[40px] font-bold text-[#22c55e]">
          Absen Masuk
        </h1>

        <p className="mt-12 text-center text-[22px] text-[#111827] leading-relaxed">
          Tempatkan wajah di
          <br />
          dalam kotak
        </p>

        {/* CAMERA */}
        <div className="mt-10 w-[320px] h-[320px] bg-[#8cb3e8] shadow-md overflow-hidden">
          {!streaming ? (
            <div className="w-full h-full flex items-center justify-center">
              <button
                onClick={startCamera}
                className="flex flex-col items-center justify-center text-black"
              >
                <User size={140} />

                <p className="mt-4 text-xl font-semibold">
                  Aktifkan Kamera
                </p>
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* BUTTON */}
        <button
          onClick={handleAbsen}
          disabled={!streaming || loadingLokasi}
          className="mt-28 w-full bg-[#6f95ef] rounded-2xl py-5 flex items-center justify-center gap-4 text-white text-[20px] font-semibold disabled:opacity-50"
        >
          {loadingLokasi ? (
            <>
              <LoaderCircle size={28} className="animate-spin" />
              Memvalidasi Lokasi...
            </>
          ) : (
            <>
              <MapPin size={28} className="animate-bounce" />
              Absen Sekarang
            </>
          )}
        </button>
      </div>
    </div>
  );
}
