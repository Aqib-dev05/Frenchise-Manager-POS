"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { orderService } from "@/services/orderService";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import { Order, User } from "@/types";
import { formatCurrency, formatDate, STATUS_COLORS } from "@/lib/utils";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineSearch, HiOutlineEye } from "react-icons/hi";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [deliverers, setDeliverers] = useState<User[]>([]);
  const [assignModal, setAssignModal] = useState<{ orderId: string; current?: string } | null>(null);
  const [selectedDeliverer, setSelectedDeliverer] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await orderService.getAll(params);
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error("Failed to load orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, status]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "salesman") {
      userService.getAll({ role: "deliverer", limit: 50 }).then((res) => setDeliverers(res.data.data)).catch(() => {});
    }
  }, [user]);

  const handleAssign = async () => {
    if (!assignModal || !selectedDeliverer) return;
    try {
      await orderService.assignDeliverer(assignModal.orderId, selectedDeliverer);
      toast.success("Deliverer assigned!");
      setAssignModal(null);
      setSelectedDeliverer("");
      fetchOrders();
    } catch { toast.error("Failed to assign"); }
  };

  const statuses = ["", "pending", "confirmed", "in-transit", "delivered", "cancelled"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h2>
          <p className="text-sm text-slate-500">{pagination.total} total orders</p>
        </div>
        {(user?.role === "admin" || user?.role === "salesman") && (
          <Link href="/dashboard/orders/new" className="btn-primary"><HiOutlinePlus className="w-5 h-5" /> New Order</Link>
        )}
      </div>

      <div className="glass-card-solid p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchOrders(); }} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order #..." className="input-field pl-10" />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field w-auto min-w-[140px]">
          {statuses.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Status"}</option>)}
        </select>
      </div>

      <div className="glass-card-solid overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 skeleton rounded-lg" />)}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 text-lg font-medium">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Deliverer</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {orders?.map((order) => (
                  <tr key={order._id}>
                    <td className="font-semibold text-primary dark:text-primary-light">{order?.orderNumber}</td>
                    <td>{order?.customer?.name}</td>
                    <td>{order.items?.length} items</td>
                    <td className="font-medium">{formatCurrency(order.grandTotal)}</td>
                    <td><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order?.status] || 'bg-slate-100'}`}>{order?.status}</span></td>
                    <td>
                      {order?.assignedTo ? (
                        <span className="text-sm">{order?.assignedTo?.name}</span>
                      ) : (user?.role === "admin" || user?.role === "salesman") ? (
                        <button onClick={() => setAssignModal({ orderId: order?._id })} className="text-xs text-primary hover:underline">Assign</button>
                      ) : <span className="text-slate-400 text-sm">—</span>}
                    </td>
                    <td className="text-sm">{formatDate(order.createdAt)}</td>
                    <td>
                      <Link href={`/dashboard/orders/${order._id}`} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary inline-block transition-colors">
                        <HiOutlineEye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-ghost text-sm disabled:opacity-30">Previous</button>
          <span className="text-sm text-slate-500">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(Math.min(pagination.pages, page + 1))} disabled={page === pagination.pages} className="btn-ghost text-sm disabled:opacity-30">Next</button>
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Assign Deliverer</h3>
            <select value={selectedDeliverer} onChange={(e) => setSelectedDeliverer(e.target.value)} className="input-field mb-4">
              <option value="">Select Deliverer</option>
              {deliverers?.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setAssignModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleAssign} className="btn-primary" disabled={!selectedDeliverer}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
