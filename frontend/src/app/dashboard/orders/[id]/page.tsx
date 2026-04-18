"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { orderService } from "@/services/orderService";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types";
import { formatCurrency, formatDateTime, STATUS_COLORS } from "@/lib/utils";
import toast from "react-hot-toast";
import { HiOutlineArrowLeft } from "react-icons/hi";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    orderService.getById(params.id as string).then((res) => setOrder(res.data.data)).catch(() => toast.error("Failed")).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [params.id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await orderService.updateStatus(params.id as string, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchOrder();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!order) return <p className="text-center text-slate-400 py-20">Order not found</p>;

  const statusTimeline = ["pending", "confirmed", "in-transit", "delivered"];
  const currentIndex = statusTimeline.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => router.back()} className="btn-ghost"><HiOutlineArrowLeft className="w-5 h-5" /> Back</button>

      <div className="glass-card-solid p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{order.orderNumber}</h2>
            <p className="text-sm text-slate-500">{formatDateTime(order.createdAt)}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
        </div>

        {/* Status Timeline */}
        {order.status !== "cancelled" && (
          <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
            {statusTimeline.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${i <= currentIndex ? "gradient-primary text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"}`}>{i + 1}</div>
                <span className={`mx-2 text-xs whitespace-nowrap ${i <= currentIndex ? "text-primary font-medium" : "text-slate-400"}`}>{s}</span>
                {i < statusTimeline.length - 1 && <div className={`w-8 h-0.5 ${i < currentIndex ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Customer</h3>
            <p className="font-medium text-slate-900 dark:text-white">{order.customer?.name}</p>
            <p className="text-sm text-slate-500">{order.customer?.phone}</p>
            <p className="text-sm text-slate-500">{order.customer?.address}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Details</h3>
            <p className="text-sm"><span className="text-slate-500">Created by:</span> <span className="text-slate-900 dark:text-white">{order.createdBy?.name}</span></p>
            <p className="text-sm"><span className="text-slate-500">Deliverer:</span> <span className="text-slate-900 dark:text-white">{order.assignedTo?.name || "Not assigned"}</span></p>
            <p className="text-sm"><span className="text-slate-500">Payment:</span> <span className="text-slate-900 dark:text-white capitalize">{order.paymentMethod}</span></p>
          </div>
        </div>

        {/* Items */}
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Items</h3>
        <div className="overflow-x-auto mb-6">
          <table className="data-table">
            <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td className="font-medium">{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="text-right space-y-1">
            <p className="text-sm text-slate-500">Subtotal: {formatCurrency(order.totalAmount)}</p>
            {order.taxAmount > 0 && <p className="text-sm text-slate-500">Tax: {formatCurrency(order.taxAmount)}</p>}
            <p className="text-xl font-bold text-primary">{formatCurrency(order.grandTotal)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {order.status !== "delivered" && order.status !== "cancelled" && (
        <div className="flex flex-wrap gap-3">
          {order.status === "pending" && (user?.role === "admin" || user?.role === "salesman") && (
            <button onClick={() => handleStatusChange("confirmed")} className="btn-primary">Confirm Order</button>
          )}
          {order.status === "confirmed" && (user?.role === "admin" || user?.role === "deliverer") && (
            <button onClick={() => handleStatusChange("in-transit")} className="btn-primary">Mark In Transit</button>
          )}
          {order.status === "in-transit" && (user?.role === "admin" || user?.role === "deliverer") && (
            <button onClick={() => handleStatusChange("delivered")} className="btn-success">Mark Delivered</button>
          )}
          {(user?.role === "admin") && (
            <button onClick={() => handleStatusChange("cancelled")} className="btn-danger">Cancel Order</button>
          )}
        </div>
      )}
    </div>
  );
}
