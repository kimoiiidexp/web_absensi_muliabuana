"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  School,
  ScanLine,
  ClipboardCheck,
  History,
  Users,
  BookOpen,
  MapPin,
  BarChart3,
  Bell,
  FileText,
} from "lucide-react";
import { getRole, getUserName, logout, type UserRole } from "@/lib/auth";

interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
}

function getNavItems(role: UserRole): NavItem[] {
  const common: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/my-activity" },
    { icon: <User size={20} />, label: "Profil", href: "/profile" },
    { icon: <Settings size={20} />, label: "Pengaturan", href: "/settings" },
  ];

  if (role === "admin") {
    return [
      { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/admin" },
      { icon: <Users size={20} />, label: "Guru", href: "/admin/guru" },
      { icon: <Users size={20} />, label: "Siswa", href: "/admin/siswa" },
      { icon: <School size={20} />, label: "Jurusan", href: "/admin/jurusan" },
      { icon: <School size={20} />, label: "Kelas", href: "/admin/kelas" },
      { icon: <BookOpen size={20} />, label: "Mapel", href: "/admin/mapel" },
      { icon: <MapPin size={20} />, label: "Mapping Guru", href: "/admin/mapping-guru" },
      { icon: <MapPin size={20} />, label: "Mapping Siswa", href: "/admin/mapping-siswa" },
      { icon: <ClipboardCheck size={20} />, label: "Monitoring", href: "/admin/monitoring" },
      { icon: <BarChart3 size={20} />, label: "Rekap", href: "/admin/rekap" },
      { icon: <Settings size={20} />, label: "Pengaturan", href: "/settings" },
    ];
  }

  if (role === "guru") {
    return [
      ...common.slice(0, 1),
      { icon: <ClipboardCheck size={20} />, label: "Kehadiran Siswa", href: "/kehadiran-siswa" },
      { icon: <ScanLine size={20} />, label: "Absen Guru", href: "/absen-guru" },
      { icon: <BarChart3 size={20} />, label: "Rekap Absensi", href: "/rekap-absensi-guru" },
      { icon: <History size={20} />, label: "Riwayat", href: "/riwayat-absen" },
      { icon: <Bell size={20} />, label: "Pengumuman", href: "/pengunguman" },
      ...common.slice(1),
    ];
  }

  return [
    ...common.slice(0, 1),
    { icon: <ScanLine size={20} />, label: "Scan QR", href: "/absen" },
    { icon: <School size={20} />, label: "Kelas Saya", href: "/kelas" },
    { icon: <FileText size={20} />, label: "Izin", href: "/izin" },
    { icon: <History size={20} />, label: "Riwayat", href: "/riwayat-absen" },
    { icon: <BarChart3 size={20} />, label: "Statistik", href: "/rekap-absensi-siswa" },
    { icon: <Bell size={20} />, label: "Pengumuman", href: "/pengunguman" },
    ...common.slice(1),
  ];
}

export default function AppShell({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState("User");

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    const userRole = getRole();
    if (!token || !userRole) {
      router.replace("/login");
      return;
    }
    setRole(userRole);
    setName(getUserName());
  }, [router]);

  if (!mounted || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef5fb]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4187b3]" />
      </div>
    );
  }

  const navItems = getNavItems(role);

  return (
    <div className="min-h-screen flex bg-[#eef5fb]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[280px] bg-white border-r border-[#4187b3]/10 shadow-sm
          flex flex-col p-5 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-[#230d7d]">Absensi MB</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-10 h-10 rounded-xl bg-[#4187b3]/10 flex items-center justify-center text-[#230d7d]"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition min-h-[44px] ${
                  active
                    ? "bg-[#4187b3] text-white"
                    : "text-[#230d7d] hover:bg-[#4187b3]/10"
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition min-h-[44px] mt-4"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-[#4187b3]/10 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-11 h-11 rounded-xl bg-[#4187b3]/10 flex items-center justify-center text-[#230d7d]"
          >
            <Menu size={22} />
          </button>
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className="text-lg font-bold text-[#230d7d] truncate">{title}</h2>
            )}
          </div>
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 min-h-[44px]"
          >
            <div className="w-10 h-10 rounded-full bg-[#a5c7dd] flex items-center justify-center text-[#230d7d] font-semibold">
              {name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium text-[#230d7d] truncate max-w-[120px]">
              {name}
            </span>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
