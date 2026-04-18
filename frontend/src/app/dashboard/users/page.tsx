"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { User } from "@/types";
import { formatDate, ROLE_OPTIONS } from "@/lib/utils";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "salesman" });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      const res = await userService.getAll(params);
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) { toast.error("Fill all required fields"); return; }
    setSubmitting(true);
    try {
      await userService.create(formData);
      toast.success("User created!");
      setShowForm(false);
      setFormData({ name: "", email: "", password: "", role: "salesman" });
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed");
    } finally { setSubmitting(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSubmitting(true);
    try {
      const updateData: Record<string, string> = { name: formData.name, email: formData.email, role: formData.role };
      if (formData.password) updateData.password = formData.password;
      await userService.update(editUser._id, updateData);
      toast.success("User updated!");
      setEditUser(null);
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await userService.delete(deleteId);
      toast.success("User deactivated");
      setDeleteId(null);
      fetchUsers();
    } catch { toast.error("Failed"); }
  };

  const roleColors: Record<string, string> = {
    admin: "bg-primary/20 text-primary dark:text-primary-light",
    salesman: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    deliverer: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h2>
        <button onClick={() => { setShowForm(true); setFormData({ name: "", email: "", password: "", role: "salesman" }); }} className="btn-primary"><HiOutlinePlus className="w-5 h-5" /> Add User</button>
      </div>

      <div className="glass-card-solid p-4">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchUsers(); }} className="flex gap-2">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..." className="input-field pl-10" />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>
      </div>

      <div className="glass-card-solid overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton rounded-lg" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="font-medium text-slate-900 dark:text-white">{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{u.role}</span></td>
                    <td>
                      <span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <span className="text-sm">{u.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="text-sm">{formatDate(u.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditUser(u); setFormData({ name: u.name, email: u.email, password: "", role: u.role }); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary transition-colors">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(u._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 hover:text-error transition-colors">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Create/Edit Modal */}
      {(showForm || editUser) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md mx-4 shadow-2xl animate-fade-in w-full">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{editUser ? "Edit User" : "New User"}</h3>
            <form onSubmit={editUser ? handleUpdate : handleCreate} className="space-y-4">
              <div><label className="input-label">Name *</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" /></div>
              <div><label className="input-label">Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" /></div>
              <div><label className="input-label">{editUser ? "New Password (leave empty)" : "Password *"}</label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" /></div>
              <div>
                <label className="input-label">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input-field">
                  {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setShowForm(false); setEditUser(null); }} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">{submitting ? "Saving..." : editUser ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Deactivate User?</h3>
            <p className="text-sm text-slate-500 mb-6">The user will not be able to log in.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="btn-danger">Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
