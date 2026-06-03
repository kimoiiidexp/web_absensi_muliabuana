"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Bell,
} from "lucide-react";

export default function PengungumanPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#eef5fb] flex">

      {/* SIDEBAR SPACE */}
      <div className="hidden lg:block w-[90px]" />

      {/* MAIN */}
      <div className="flex-1 p-6 lg:p-10">

        {/* HEADER */}
        <div
          className="
            relative
            overflow-hidden
            rounded-[35px]
            bg-[#9fc8eb]
            p-8
            lg:p-10
            shadow-sm
            border
            border-[#4187b3]/20
            mb-8
          "
        >

          {/* TOP */}
          <div className="flex items-center justify-between">

            <button
              onClick={() => router.back()}
              className="
                w-[50px]
                h-[50px]
                rounded-2xl
                bg-white/70
                backdrop-blur-md
                flex
                items-center
                justify-center
                text-[#230d7d]
                shadow-sm
                hover:scale-105
                transition
              "
            >
              <ArrowLeft size={24} />
            </button>

            

          </div>

          {/* TITLE */}
          <div className="mt-10">

            <div className="flex items-center gap-4 mb-3">

              <div
                className="
                  w-[70px]
                  h-[70px]
                  rounded-2xl
                  bg-white/60
                  flex
                  items-center
                  justify-center
                  text-[#230d7d]
                  shadow-sm
                "
              >
                <Bell size={34} />
              </div>

              <div>
                <p className="text-[#230d7d]/70 font-medium">
                  Sekolah
                </p>

                <h1 className="text-4xl font-bold text-[#111827]">
                  Pengunguman
                </h1>
              </div>

            </div>

            <p className="text-[#230d7d]/70 text-lg max-w-[600px]">
              Informasi terbaru, agenda sekolah, dan berita penting
              untuk siswa maupun guru.
            </p>

          </div>

          {/* DECORATION */}
          <div
            className="
              absolute
              -right-10
              -bottom-10
              w-[180px]
              h-[180px]
              rounded-full
              bg-white/20
            "
          />

        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">

          {/* LEFT */}
          <div className="space-y-6">

            <AnnouncementCard
              title="Pengunguman 1"
              desc="Jadwal kegiatan belajar mengajar minggu depan mengalami perubahan."
            />

            <AnnouncementCard
              title="Pengunguman 2"
              desc="Seluruh siswa diwajibkan memakai atribut lengkap pada hari Senin."
            />

            <AnnouncementCard
              title="Pengunguman 3"
              desc="Guru diminta melakukan validasi absensi sebelum pukul 16.00."
            />

          </div>

          {/* RIGHT IMAGE PANEL */}
          <div
            className="
              bg-white
              rounded-[35px]
              overflow-hidden
              shadow-sm
              border
              border-[#4187b3]/10
              h-fit
            "
          >

            <Image
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop"
              alt="Suasana sekolah"
              width={1200}
              height={500}
              className="
                w-full
                h-[500px]
                object-cover
              "
            />

          </div>

        </div>

      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function AnnouncementCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div
      className="
        bg-white/90
        backdrop-blur-lg
        rounded-[28px]
        p-6
        border
        border-[#4187b3]/20
        shadow-sm
        hover:shadow-md
        hover:-translate-y-1
        transition
        cursor-pointer
      "
    >

      <div className="flex items-start justify-between gap-4">

        <div>

          <h2 className="text-2xl font-bold text-[#111827] mb-2">
            {title}
          </h2>

          <p className="text-[#230d7d]/70 leading-relaxed">
            {desc}
          </p>

        </div>

        <div
          className="
            min-w-[55px]
            h-[55px]
            rounded-2xl
            bg-[#9fc8eb]/30
            flex
            items-center
            justify-center
            text-[#230d7d]
          "
        >
          <Bell size={24} />
        </div>

      </div>

    </div>
  );
}
