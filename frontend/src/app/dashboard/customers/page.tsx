"use client";

import { useEffect, useState } from "react";
import { customerService } from "@/services/customerService";
import { Customer } from "@/types";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineSearch } from "react-icons/hi";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      const res = await customerService.getAll(params);
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error("Failed to load customers"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) { toast.error("Name and phone required"); return; }
    setSubmitting(true);
    try {
      await customerService.create(formData);
      toast.success("Customer created!");
      setShowForm(false);
      setFormData({ name: "", phone: "", address: "" });
      fetchCustomers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Customers</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary"><HiOutlinePlus className="w-5 h-5" /> Add Customer</button>
      </div>

      <div className="glass-card-solid p-4">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchCustomers(); }} className="flex gap-2">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or phone..." className="input-field pl-10" />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>
      </div>

      <div className="glass-card-solid overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton rounded-lg" />)}</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No customers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Phone</th><th>Address</th><th>Created By</th><th>Date</th></tr></thead>
              <tbody>
                {customers?.map((c) => (
                  <tr key={c._id}>
                    <td className="font-medium text-slate-900 dark:text-white">{c?.name}</td>
                    <td>{c?.phone}</td>
                    <td className="max-w-[200px] truncate">{c?.address || "—"}</td>
                    <td>{c?.createdBy?.name}</td>
                    <td className="text-sm">{formatDate(c?.createdAt)}</td>
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

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md mx-4 shadow-2xl animate-fade-in w-full">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">New Customer</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="input-label">Name *</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" /></div>
              <div><label className="input-label">Phone *</label><input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" /></div>
              <div><label className="input-label">Address</label><input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-field" /></div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">{submitting ? "Creating..." : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
