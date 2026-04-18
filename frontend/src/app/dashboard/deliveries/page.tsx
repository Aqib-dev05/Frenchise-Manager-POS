"use client";

import { useEffect, useState, useCallback } from "react";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";
import { formatCurrency, STATUS_COLORS } from "@/lib/utils";
import toast from "react-hot-toast";
import { HiOutlineTruck, HiOutlineCheck, HiOutlineRefresh } from "react-icons/hi";

export default function DeliveriesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderService.getAll({ limit: 50 });
      setOrders(res.data.data);
    } catch { toast.error("Failed to load deliveries"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Poll every 30s
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatus = async (orderId: string, status: string) => {
    try {
      await orderService.updateStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const confirmed = orders.filter((o) => o.status === "confirmed");
  const inTransit = orders.filter((o) => o.status === "in-transit");
  const delivered = orders.filter((o) => o.status === "delivered");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Deliveries</h2>
        <button onClick={fetchOrders} className="btn-ghost text-sm"><HiOutlineRefresh className="w-4 h-4" /> Refresh</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div>
      ) : (
        <>
          {/* Confirmed - Ready for Pickup */}
          <Section title={`Ready for Pickup (${confirmed.length})`} color="bg-blue-500">
            {confirmed.map((order) => (
              <DeliveryCard key={order._id} order={order}>
                <button onClick={() => handleStatus(order._id, "in-transit")} className="btn-primary text-sm"><HiOutlineTruck className="w-4 h-4" /> Pick Up</button>
              </DeliveryCard>
            ))}
          </Section>

          {/* In Transit */}
          <Section title={`In Transit (${inTransit.length})`} color="bg-violet-500">
            {inTransit.map((order) => (
              <DeliveryCard key={order._id} order={order}>
                <button onClick={() => handleStatus(order._id, "delivered")} className="btn-success text-sm"><HiOutlineCheck className="w-4 h-4" /> Delivered</button>
              </DeliveryCard>
            ))}
          </Section>

          {/* Delivered */}
          <Section title={`Completed (${delivered.length})`} color="bg-emerald-500">
            {delivered.slice(0, 5).map((order) => <DeliveryCard key={order._id} order={order} />)}
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DeliveryCard({ order, children }: { order: Order; children?: React.ReactNode }) {
  return (
    <div className="glass-card-solid p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-primary dark:text-primary-light">{order.orderNumber}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300">{order.customer?.name} — {order.customer?.phone}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{order.customer?.address}</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{formatCurrency(order.grandTotal)}</p>
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}
