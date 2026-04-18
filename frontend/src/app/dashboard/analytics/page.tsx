"use client";

import { useEffect, useState } from "react";
import { analyticsService } from "@/services/analyticsService";
import { DashboardData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { HiOutlineCurrencyDollar, HiOutlineShoppingCart, HiOutlineTrendingUp, HiOutlineExclamation } from "react-icons/hi";

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboard().then((res) => setData(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6">{[...Array(4)].map((_, i) => <div key={i} className="h-40 skeleton rounded-2xl" />)}</div>;
  if (!data) return <p className="text-slate-400 text-center py-20">Failed to load analytics</p>;

  const statusColors: Record<string, string> = { pending: "#f59e0b", confirmed: "#3b82f6", "in-transit": "#8b5cf6", delivered: "#10b981", cancelled: "#ef4444" };
  const pieData = data.ordersByStatus.map((s) => ({ name: s._id, value: s.count, color: statusColors[s._id] || "#94a3b8" }));

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={HiOutlineCurrencyDollar} gradient="from-indigo-500 to-violet-600" />
        <StatCard label="This Month" value={`${data.ordersThisMonth} orders`} icon={HiOutlineTrendingUp} gradient="from-emerald-500 to-teal-600" />
        <StatCard label="This Week" value={`${data.ordersThisWeek} orders`} icon={HiOutlineShoppingCart} gradient="from-amber-500 to-orange-600" />
        <StatCard label="Low Stock Items" value={data.lowStockCount} icon={HiOutlineExclamation} gradient="from-rose-500 to-pink-600" />
      </div>

      {/* Revenue Chart */}
      <div className="glass-card-solid p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Daily Revenue (30 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.revenueByDay}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px" }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="glass-card-solid p-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Top Selling Products</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px" }} />
                <Bar dataKey="totalQty" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="glass-card-solid p-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Orders by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px" }} />
                <Legend formatter={(value) => <span className="text-xs text-slate-400 capitalize">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, gradient }: { label: string; value: number | string; icon: React.ElementType; gradient: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} text-white shadow-xl`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-10 h-10 text-white/30" />
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
    </div>
  );
}
