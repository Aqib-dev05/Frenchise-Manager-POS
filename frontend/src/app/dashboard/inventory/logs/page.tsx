"use client";

import { useEffect, useState } from "react";
import { inventoryService } from "@/services/inventoryService";
import { StockLog } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { HiOutlineArrowLeft } from "react-icons/hi";
import Link from "next/link";

export default function StockLogsPage() {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    inventoryService.getLogs({ page, limit: 20 }).then((res) => {
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventory" className="btn-ghost"><HiOutlineArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Stock History</h2>
          <p className="text-sm text-slate-500">Audit trail of all inventory changes</p>
        </div>
      </div>

      <div className="glass-card-solid overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-10 skeleton rounded-lg" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Qty</th><th>Reason</th><th>By</th></tr></thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="text-xs whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                    <td className="font-medium">{log.product?.name}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${log.type === "in" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"}`}>
                        {log.type === "in" ? "Stock In" : "Stock Out"}
                      </span>
                    </td>
                    <td className="font-semibold">{log.type === "in" ? "+" : "-"}{log.quantity}</td>
                    <td className="text-sm max-w-[200px] truncate">{log.reason}</td>
                    <td className="text-sm">{log.performedBy?.name}</td>
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
    </div>
  );
}
