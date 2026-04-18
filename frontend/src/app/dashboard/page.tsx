"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { analyticsService } from "@/services/analyticsService";
import { orderService } from "@/services/orderService";
import { DashboardData, Order } from "@/types";
import { formatCurrency, STATUS_COLORS } from "@/lib/utils";
import {
  HiOutlineCurrencyDollar,
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineExclamation,
  HiOutlineTruck,
} from "react-icons/hi";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "salesman") return <SalesmanDashboard />;
  if (user?.role === "deliverer") return <DelivererDashboard />;

  return null;
}

function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <p className="text-slate-400">Failed to load dashboard data.</p>;

  const statCards = [
    { label: "Total Revenue", value: formatCurrency(data.totalRevenue), icon: HiOutlineCurrencyDollar, color: "from-indigo-500 to-violet-600", shadowColor: "shadow-indigo-500/20" },
    { label: "Orders Today", value: data.ordersToday, icon: HiOutlineShoppingCart, color: "from-emerald-500 to-teal-600", shadowColor: "shadow-emerald-500/20" },
    { label: "Total Orders", value: data.totalOrders, icon: HiOutlineCube, color: "from-amber-500 to-orange-600", shadowColor: "shadow-amber-500/20" },
    { label: "Active Users", value: data.activeUsers, icon: HiOutlineUsers, color: "from-rose-500 to-pink-600", shadowColor: "shadow-rose-500/20" },
  ];

  const statusColorMap: Record<string, string> = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    "in-transit": "#8b5cf6",
    delivered: "#10b981",
    cancelled: "#ef4444",
  };

  const pieData = data.ordersByStatus.map((s) => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
    color: statusColorMap[s._id] || "#94a3b8",
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${card.color} text-white shadow-xl ${card.shadowColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <card.icon className="w-10 h-10 text-white/30" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>

      {/* Low stock warning */}
      {data.lowStockCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
          <HiOutlineExclamation className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>{data.lowStockCount} product(s)</strong> are below minimum stock threshold. Check inventory.
          </p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card-solid p-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Revenue (Last 30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueByDay}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", fontSize: "13px" }}
                  labelStyle={{ color: "#f1f5f9" }}
                  itemStyle={{ color: "#818cf8" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="glass-card-solid p-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Orders by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", fontSize: "13px" }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="glass-card-solid p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Top Selling Products</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", fontSize: "13px" }}
              />
              <Bar dataKey="totalQty" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SalesmanDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getAll({ limit: 5 })
      .then((res) => setOrders(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === new Date().toDateString()
  );
  const pendingOrders = orders.filter((o) => o.status === "pending");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Orders Today" value={todayOrders.length} icon={HiOutlineShoppingCart} gradient="from-indigo-500 to-violet-600" />
        <StatCard label="Pending Orders" value={pendingOrders.length} icon={HiOutlineCube} gradient="from-amber-500 to-orange-600" />
        <StatCard label="Total Orders" value={orders.length} icon={HiOutlineTruck} gradient="from-emerald-500 to-teal-600" />
      </div>

      <div className="glass-card-solid p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Recent Orders</h3>
        {orders.length === 0 ? (
          <p className="text-slate-400 text-sm">No orders yet. Start creating orders!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="font-medium">{order.orderNumber}</td>
                    <td>{order.customer?.name}</td>
                    <td>{formatCurrency(order.grandTotal)}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function DelivererDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getAll({ limit: 10 })
      .then((res) => setOrders(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const pending = orders.filter((o) => ["confirmed"].includes(o.status));
  const inTransit = orders.filter((o) => o.status === "in-transit");
  const delivered = orders.filter(
    (o) =>
      o.status === "delivered" &&
      new Date(o.updatedAt).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pending Pickup" value={pending.length} icon={HiOutlineCube} gradient="from-amber-500 to-orange-600" />
        <StatCard label="In Transit" value={inTransit.length} icon={HiOutlineTruck} gradient="from-violet-500 to-purple-600" />
        <StatCard label="Delivered Today" value={delivered.length} icon={HiOutlineShoppingCart} gradient="from-emerald-500 to-teal-600" />
      </div>

      <div className="glass-card-solid p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Delivery Queue</h3>
        {orders.length === 0 ? (
          <p className="text-slate-400 text-sm">No deliveries assigned to you yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="font-medium">{order.orderNumber}</td>
                    <td>{order.customer?.name}</td>
                    <td className="max-w-[200px] truncate">{order.customer?.address}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl skeleton" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl skeleton" />
        <div className="h-80 rounded-2xl skeleton" />
      </div>
    </div>
  );
}
