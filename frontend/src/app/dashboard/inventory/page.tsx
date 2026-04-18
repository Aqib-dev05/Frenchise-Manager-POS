"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { inventoryService } from "@/services/inventoryService";
import { InventoryItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { HiOutlineSearch, HiOutlinePlus, HiOutlineDownload, HiOutlineExclamation } from "react-icons/hi";

export default function InventoryPage() {
  const searchParams = useSearchParams();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lowStock, setLowStock] = useState(searchParams.get("lowStock") === "true");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      if (lowStock) params.lowStock = "true";
      const res = await inventoryService.getAll(params);
      setInventory(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error("Failed to load inventory"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInventory(); }, [page, lowStock]);

  const handleExport = async () => {
    try {
      const res = await inventoryService.exportCSV();
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast.success("CSV exported!");
    } catch { toast.error("Export failed"); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track stock levels and manage supply</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary"><HiOutlineDownload className="w-5 h-5" /> Export CSV</button>
          <Link href="/dashboard/inventory/stock-in" className="btn-primary"><HiOutlinePlus className="w-5 h-5" /> Stock In</Link>
        </div>
      </div>

      <div className="glass-card-solid p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchInventory(); }} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-10" />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>
        <button onClick={() => { setLowStock(!lowStock); setPage(1); }} className={`btn ${lowStock ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "btn-secondary"}`}>
          <HiOutlineExclamation className="w-5 h-5" /> {lowStock ? "Show All" : "Low Stock"}
        </button>
      </div>

      <div className="glass-card-solid overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton rounded-lg" />)}</div>
        ) : inventory.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No inventory data found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Product</th><th>SKU</th><th>Price</th><th>Stock</th><th>Threshold</th><th>Status</th></tr>
              </thead>
              <tbody>
                {inventory?.map((item) => {
                  const isLow = item.currentStock <= item.minThreshold;
                  return (
                    <tr key={item._id}>
                      <td className="font-medium text-slate-900 dark:text-white">{item.product?.name}</td>
                      <td><code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{item.product?.sku}</code></td>
                      <td>{formatCurrency(item.product?.unitPrice || 0)}</td>
                      <td className={`font-semibold ${isLow ? "text-error" : "text-accent"}`}>{item.currentStock}</td>
                      <td>{item.minThreshold}</td>
                      <td>
                        {isLow ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <HiOutlineExclamation className="w-4 h-4" /> Low Stock
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">In Stock</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

      <div className="text-center">
        <Link href="/dashboard/inventory/logs" className="text-sm text-primary hover:underline">View Stock History Logs →</Link>
      </div>
    </div>
  );
}
