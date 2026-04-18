"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineClipboardList,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineTruck,
  HiOutlineExclamation,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { inventoryService } from "@/services/inventoryService";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  badge?: number;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      inventoryService.getLowStock().then((res) => {
        setLowStockCount(res.data.count || 0);
      }).catch(() => {});
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: HiOutlineHome, roles: ["admin", "salesman", "deliverer"] },
    { label: "Products", href: "/dashboard/products", icon: HiOutlineCube, roles: ["admin"] },
    { label: "Inventory", href: "/dashboard/inventory", icon: HiOutlineClipboardList, roles: ["admin"], badge: user.role === "admin" ? lowStockCount : undefined },
    { label: "Orders", href: "/dashboard/orders", icon: HiOutlineShoppingCart, roles: ["admin", "salesman"] },
    { label: "Deliveries", href: "/dashboard/deliveries", icon: HiOutlineTruck, roles: ["deliverer"] },
    { label: "Customers", href: "/dashboard/customers", icon: HiOutlineUserGroup, roles: ["admin", "salesman"] },
    { label: "Invoices", href: "/dashboard/invoices", icon: HiOutlineDocumentText, roles: ["admin", "salesman"] },
    { label: "Analytics", href: "/dashboard/analytics", icon: HiOutlineChartBar, roles: ["admin"] },
    { label: "Users", href: "/dashboard/users", icon: HiOutlineUsers, roles: ["admin"] },
    { label: "Settings", href: "/dashboard/settings", icon: HiOutlineCog, roles: ["admin"] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const roleColors: Record<string, string> = {
    admin: "bg-primary/20 text-primary-light",
    salesman: "bg-emerald-500/20 text-emerald-400",
    deliverer: "bg-amber-500/20 text-amber-400",
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-sm font-bold text-white">AR</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">AR Traders</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">POS System</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/10 text-primary dark:text-primary-light"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary dark:text-primary-light" : ""}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full bg-error text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
              <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${roleColors[user.role]}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-error dark:hover:text-error rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <HiOutlineLogout className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <HiOutlineMenu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
              {pathname === "/dashboard"
                ? "Dashboard"
                : pathname.split("/").pop()?.replace(/-/g, " ")}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Low stock alert */}
            {user.role === "admin" && lowStockCount > 0 && (
              <Link
                href="/dashboard/inventory?lowStock=true"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              >
                <HiOutlineExclamation className="w-4 h-4" />
                {lowStockCount} Low Stock
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
