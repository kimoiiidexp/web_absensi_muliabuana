"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Menu,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Pencil,
  School,
  ScanLine,
  ClipboardCheck,
  Bell,
  History,
} from "lucide-react";

export default function MyActivityPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [role, setRole] = useState<"guru" | "siswa">("siswa");
  const [name, setName] = useState("User");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userRole =
      localStorage.getItem("role")?.toLowerCase() === "guru"
        ? "guru"
        : "siswa";
    setRole(userRole);
    setName(localStorage.getItem("name") || "User");
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef5fb]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#eef5fb]">

      {/* SIDEBAR */}
      <div
        className={`
          ${
            sidebarOpen ? "w-[260px]" : "w-[90px]"
          }
          transition-all duration-300
          bg-white/80
          backdrop-blur-xl
          border-r border-[#4187b3]/10
          shadow-sm
          flex flex-col justify-between
          p-5
        `}
      >

        <div>

          {/* TOP */}
          <div className="flex items-center justify-between mb-10">

            {sidebarOpen && (
              <h1 className="text-2xl font-bold text-[#230d7d]">
                Absensi App
              </h1>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="
                w-[42px]
                h-[42px]
                rounded-xl
                bg-[#4187b3]/10
                flex
                items-center
                justify-center
                text-[#230d7d]
                hover:bg-[#4187b3]/20
                transition
              "
            >
              <Menu size={22} />
            </button>

          </div>

          {/* MENU */}
<div className="flex flex-col gap-3">

  {/* DEFAULT MENU */}
  <SidebarItem
    icon={<LayoutDashboard size={22} />}
    label="Dashboard"
    open={sidebarOpen}
    onClick={() => router.push("/my-activity")}
  />

  <SidebarItem
    icon={<User size={22} />}
    label="Profile"
    open={sidebarOpen}
    onClick={() => router.push("/profile")}
  />

  <SidebarItem
    icon={<Settings size={22} />}
    label="Settings"
    open={sidebarOpen}
    onClick={() => router.push("/settings")}
  />

  {/* ================= GURU ================= */}
  {role === "guru" ? (
    <>

      <SidebarItem
        icon={<Bell size={22} />}
        label="Pengunguman"
        open={sidebarOpen}
        onClick={() => router.push("/pengunguman")}
      />

      <SidebarItem
        icon={<Pencil size={22} />}
        label="Kehadiran Siswa"
        open={sidebarOpen}
        onClick={() => router.push("/kehadiran-siswa")}
      />

      {/* ABSEN GURU */}
      <div
        className="
          rounded-2xl
          hover:bg-[#4187b3]/10
          transition
          p-3
        "
      >

        <div className="flex items-center gap-4 text-[#230d7d]">

          <ClipboardCheck size={22} />

          {sidebarOpen && (
            <p className="font-medium">
              Absen Guru
            </p>
          )}

        </div>

        {/* SUB MENU */}
        {sidebarOpen && (
          <div className="ml-10 mt-4 flex flex-col gap-3">

            <button
              onClick={() => router.push("/absen-masuk")}
              className="
                text-left
                text-[#230d7d]/70
                hover:text-[#230d7d]
                transition
              "
            >
              • Absen Masuk
            </button>

            <button
              onClick={() => router.push("/absen-keluar")}
              className="
                text-left
                text-[#230d7d]/70
                hover:text-[#230d7d]
                transition
              "
            >
              • Absen Keluar
            </button>

          </div>
        )}

      </div>

      <SidebarItem
        icon={<History size={22} />}
        label="Riwayat Absen"
        open={sidebarOpen}
        onClick={() => router.push("/riwayat-absen")}
      />

    </>
  ) : (
    <>
      {/* ================= SISWA ================= */}

      <SidebarItem
        icon={<Bell size={22} />}
        label="Pengunguman"
        open={sidebarOpen}
        onClick={() => router.push("/pengunguman")}
      />

      <SidebarItem
        icon={<Pencil size={22} />}
        label="Izin Siswa"
        open={sidebarOpen}
        onClick={() => router.push("/izin")}
      />

      <SidebarItem
        icon={<School size={22} />}
        label="Kelas"
        open={sidebarOpen}
        onClick={() => router.push("/kelas")}
      />

      <SidebarItem
        icon={<History size={22} />}
        label="Riwayat Absen"
        open={sidebarOpen}
        onClick={() => router.push("/riwayat-absen")}
      />
    </>
  )}

</div>
        </div>

        {/* LOGOUT */}
<SidebarItem
  icon={<LogOut size={22} />}
  label="Logout"
  open={sidebarOpen}
  danger
  onClick={() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");

    router.push("/login");
  }}
/>

      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">

          <div
            onClick={() => router.push("/profile")}
            className="
              flex
              items-center
              gap-4
              cursor-pointer
              hover:opacity-80
              transition
            "
          >

            <div
              className="
                w-[70px]
                h-[70px]
                rounded-full
                bg-[#a5c7dd]
                flex
                items-center
                justify-center
                text-[#230d7d]
                text-xl
                font-semibold
                shadow-sm
              "
            >
              {name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#230d7d]">
                {name}
              </h2>

              <p className="text-[#230d7d]/70 capitalize">
                {role}
              </p>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            <div
              className="
                w-[48px]
                h-[48px]
                rounded-xl
                bg-white
                flex
                items-center
                justify-center
                shadow-sm
                border
                border-[#4187b3]/10
                text-[#230d7d]
                cursor-pointer
                hover:shadow-md
                transition
              "
            >
              <Bell size={22} />
            </div>

            <div
              className="
                w-[48px]
                h-[48px]
                rounded-xl
                bg-white
                flex
                items-center
                justify-center
                shadow-sm
                border
                border-[#4187b3]/10
                text-[#230d7d]
                cursor-pointer
                hover:shadow-md
                transition
              "
            >
              <History size={22} />
            </div>

          </div>

        </div>

        {/* ACTION PANEL */}
        <div
          className="
            bg-[#cfe5f5]
            rounded-[30px]
            p-8
            border
            border-[#4187b3]/10
            shadow-md
            mb-10
          "
        >

          <div className="grid grid-cols-3 gap-6">

            {role === "siswa" ? (
              <>
                <ActionCard
                  title="Rekap Absen"
                  icon={<School size={34} />}
                  link="/rekap-absensi"
                />

                <ActionCard
                  title="Kelas"
                  icon={<School size={34} />}
                  link="/kelas"
                />

                <ActionCard
                  title="AutoScan"
                  icon={<ScanLine size={34} />}
                  link="/autoscan"
                />
              </>
            ) : (
              <>
                <ActionCard
                  title="Absen Guru"
                  icon={<ClipboardCheck size={34} />}
                  link="/absen-guru"
                />

                <ActionCard
                  title="Rekap Absen"
                  icon={<School size={34} />}
                  link="/rekap-absensi"
                />

                <ActionCard
                  title="Riwayat"
                  icon={<History size={34} />}
                  link="/riwayat"
                />
              </>
            )}

          </div>

        </div>

        {/* JADWAL */}
        <div
          className="
            bg-white/80
            backdrop-blur-lg
            rounded-[30px]
            border
            border-[#4187b3]/10
            shadow-md
            p-8
          "
        >

          <div className="flex items-center justify-between mb-8">

            <h3 className="text-2xl font-bold text-[#230d7d]">
              Jadwal Hari Ini
            </h3>

            <p className="text-[#230d7d]/70">
              Senin, 20 April 2026
            </p>

          </div>

          <div className="space-y-5">

            <ScheduleCard
              time="07.00"
              title="Produktif Terbaru"
              subtitle="TKJ 1"
            />

            <ScheduleCard
              time="10.00"
              title="Basis Data"
              subtitle="RPL 2"
            />

            <ScheduleCard
              time="13.00"
              title="Pemrograman Web"
              subtitle="TKJ 3"
            />

          </div>

        </div>

      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function SidebarItem({
  icon,
  label,
  open,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  open: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        flex
        items-center
        gap-4
        p-3
        rounded-2xl
        cursor-pointer
        transition-all
        hover:bg-[#4187b3]/10
        ${
          danger
            ? "text-red-500"
            : "text-[#230d7d]"
        }
      `}
    >

      <div>{icon}</div>

      {open && (
        <p className="font-medium">
          {label}
        </p>
      )}

    </div>
  );
}

function ActionCard({
  title,
  icon,
  link,
}: {
  title: string;
  icon: React.ReactNode;
  link: string;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(link)}
      className="
        bg-[#f8faec]
        rounded-[26px]
        p-8
        flex
        flex-col
        items-center
        justify-center
        gap-5
        cursor-pointer
        border
        border-[#4187b3]/10
        hover:scale-[1.02]
        hover:shadow-lg
        transition-all
        duration-300
      "
    >

      <div
        className="
          w-[85px]
          h-[85px]
          rounded-full
          bg-white
          flex
          items-center
          justify-center
          text-[#4187b3]
          shadow-sm
        "
      >
        {icon}
      </div>

      <p className="text-[#230d7d] font-semibold text-lg">
        {title}
      </p>

    </div>
  );
}

function ScheduleCard({
  time,
  title,
  subtitle,
}: {
  time: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        p-6
        rounded-[24px]
        bg-white
        border
        border-[#4187b3]/10
        hover:shadow-md
        hover:-translate-y-1
        transition-all
      "
    >

      <div className="flex items-center gap-6">

        <div
          className="
            bg-[#eef5fb]
            px-5
            py-3
            rounded-2xl
            text-[#230d7d]
            font-semibold
          "
        >
          Jam {time}
        </div>

        <div>
          <p className="text-[#230d7d] font-semibold text-lg">
            {title}
          </p>

          <p className="text-[#230d7d]/70">
            {subtitle}
          </p>
        </div>

      </div>

      <button
        className="
          px-5
          py-2
          rounded-xl
          bg-[#4187b3]
          text-white
          hover:opacity-90
          transition
        "
      >
        Detail
      </button>

    </div>
  );
}