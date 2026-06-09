"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { apiUrl } from "@/lib/api";
import AppShell from "@/components/AppShell";

export default function AbsenPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<any>(null);
 const [cameraFacing, setCameraFacing] =
  useState<"environment" | "user">("environment");

  useEffect(() => {
    setMounted(true);
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setMessage({
            type: "error",
            text: "Tidak bisa mendapatkan lokasi. Pastikan GPS aktif.",
          });
        }
      );
    }
  }, []);

  useEffect(() => {
  if (!mounted) return;
  if (scanning) return;

  let scanner: any = null;
  let cancelled = false;

  const initScanner = async () => {
    try {
      console.log("INIT SCANNER");

      const QrScanner = (await import("qr-scanner")).default;

      console.log("QR IMPORT SUCCESS");

      // tunggu video benar-benar ada di DOM
      let retry = 0;

      while (!videoRef.current && retry < 20) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        retry++;
      }

      if (!videoRef.current) {
        console.error("VIDEO ELEMENT NOT FOUND");
        return;
      }

      console.log("VIDEO FOUND");

      scanner = new QrScanner(
        videoRef.current,
        async (result: any) => {
          if (scanning) return;

          console.log("QR DETECTED", result);

          setScanning(true);

          const qrData =
            typeof result === "string"
              ? result
              : result?.data || result;

          console.log("QR CONTENT:", qrData);
        },

        {
        preferredCamera: cameraFacing,
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }

      );
      console.log("HTTPS?", window.location.protocol);
      console.log("mediaDevices", navigator.mediaDevices);

      await scanner.start();
      
      console.log(
          "VIDEO SIZE:",
          videoRef.current?.videoWidth,
          videoRef.current?.videoHeight
        );

        console.log(
          "READY STATE:",
          videoRef.current?.readyState
        );

      if (cancelled) {
        scanner.stop();
        scanner.destroy();
        return;
      }

      console.log("SCANNER STARTED");

      console.log(
        "STREAM:",
        videoRef.current?.srcObject
      );

      scannerRef.current = scanner;
    } catch (err: any) {
  console.error("SCANNER ERROR", err);

  console.error("NAME:", err?.name);
  console.error("MESSAGE:", err?.message);

      setMessage({
        type: "error",
        text: "Tidak dapat mengakses kamera",
      });
    }
  };

  initScanner();

  return () => {
    cancelled = true;

    if (scanner) {
      scanner.stop();
      scanner.destroy();
    }

    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
    }
  };
}, [mounted, scanning, cameraFacing]);


  

  const handleAbsen = async (token: string) => {
   if (latitude === null || longitude === null) {
      setMessage({
        type: "error",
        text: "Lokasi tidak ditemukan. Pastikan GPS aktif.",
      });
      setScanning(false);
      return;
    }

    setLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      const response = await fetch(
        apiUrl("/api/siswa/absen"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            token,
            latitude,
            longitude,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: typeof data === "string" ? data : "Absen gagal",
        });
        setScanning(false);
        return;
      }

      setMessage({
        type: "success",
        text: "Absen berhasil! ✓",
      });

      setTimeout(() => {
        router.push("/my-activity");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: "error",
        text: "Terjadi kesalahan. Coba lagi.",
      });
      setScanning(false);
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
    <AppShell title="Scan QR Absensi">
      {/* CAMERA CONTAINER */}
      <div className="bg-white rounded-[20px] shadow-md overflow-hidden border border-[#4187b3]/10 mb-8">
        <div className="relative w-full aspect-square bg-black">
          <video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  className="w-full h-full object-cover"
  style={{ transform: "scaleX(-1)" }}
/>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-4 border-[#4187b3] rounded-lg opacity-50"></div>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader size={48} className="text-white animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mb-6">
  <button
    onClick={() =>
      setCameraFacing((prev) =>
        prev === "environment"
          ? "user"
          : "environment"
      )
    }
    className="px-4 py-2 bg-[#4187b3] text-white rounded-lg"
  >
    {cameraFacing === "environment"
      ? "Pakai Kamera Depan"
      : "Pakai Kamera Belakang"}
  </button>
</div>

<p className="text-center text-sm text-gray-500 mb-4">
  Kamera aktif:
  {cameraFacing === "environment"
    ? " Belakang"
    : " Depan"}
</p>

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

      {/* INFO */}
      <div className="bg-white rounded-[15px] p-6 border border-[#4187b3]/10 shadow-sm">
        <div className="flex items-start gap-3">
          <Camera size={24} className="text-[#4187b3] flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-[#230d7d] mb-2">
              Cara Menggunakan
            </h3>
            <ul className="text-[#230d7d]/70 text-sm space-y-1">
              <li>• Arahkan kamera ke QR Code dari guru</li>
              <li>• Pastikan GPS/lokasi aktif</li>
              <li>• Tunggu hingga scan berhasil</li>
              <li>• Anda akan otomatis kembali ke dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

