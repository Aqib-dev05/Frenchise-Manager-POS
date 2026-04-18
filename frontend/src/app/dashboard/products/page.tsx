"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productService } from "@/services/productService";
import { Product, PaginatedResponse } from "@/types";
import { formatCurrency, CATEGORY_OPTIONS } from "@/lib/utils";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineCube } from "react-icons/hi";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await productService.getAll(params);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productService.delete(deleteId);
      toast.success("Product deleted");
      setDeleteId(null);
      fetchProducts();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your product catalog</p>
        </div>
        <Link href="/dashboard/products/new" className="btn-primary">
          <HiOutlinePlus className="w-5 h-5" /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card-solid p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU, brand..."
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>
        <select
          value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="input-field w-auto min-w-[140px]"
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card-solid overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton rounded-lg" />)}</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <HiOutlineCube className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No products found</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Start by adding your first product</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {product?.imageUrl ? (
                          <img src={product.imageUrl} alt={product?.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <HiOutlineCube className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{product?.name}</p>
                          <p className="text-xs text-slate-500">{product?.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td><code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{product?.sku}</code></td>
                    <td className="capitalize">{product?.category?.replace("-", " ") || "N/A"}</td>
                    <td className="capitalize">{product?.unit}</td>
                    <td className="font-medium">{formatCurrency(product?.unitPrice || 0)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/products/${product._id}/edit`} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary transition-colors">
                          <HiOutlinePencil className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteId(product._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 hover:text-error transition-colors">
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

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-ghost text-sm disabled:opacity-30">Previous</button>
          <span className="text-sm text-slate-500">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(Math.min(pagination.pages, page + 1))} disabled={page === pagination.pages} className="btn-ghost text-sm disabled:opacity-30">Next</button>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Delete Product?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
