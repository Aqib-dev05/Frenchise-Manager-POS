"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { inventoryService } from "@/services/inventoryService";
import { productService } from "@/services/productService";
import { Product } from "@/types";
import toast from "react-hot-toast";
import { HiOutlineArrowLeft } from "react-icons/hi";

export default function StockInPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ productId: "", quantity: "", supplierName: "", costPrice: "", reason: "Stock received" });

  useEffect(() => {
    productService.getAll({ limit: 100 }).then((res) => setProducts(res.data.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity) { toast.error("Select a product and enter quantity"); return; }
    setLoading(true);
    try {
      await inventoryService.stockIn({
        productId: formData.productId,
        quantity: parseInt(formData.quantity),
        supplierName: formData.supplierName,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        reason: formData.reason,
      });
      toast.success("Stock added successfully!");
      router.push("/dashboard/inventory");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <button onClick={() => router.back()} className="btn-ghost mb-4"><HiOutlineArrowLeft className="w-5 h-5" /> Back</button>
      <div className="glass-card-solid p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Receive Stock</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="input-label">Product *</label>
            <select value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} className="input-field">
              <option value="">Select Product</option>
              {products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Quantity *</label>
              <input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="input-label">Cost Price</label>
              <input type="number" min="0" step="0.01" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="input-label">Supplier Name</label>
            <input value={formData.supplierName} onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })} className="input-field" placeholder="Optional" />
          </div>
          <div>
            <label className="input-label">Reason</label>
            <input value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-success w-full">
            {loading ? "Adding..." : "Add Stock"}
          </button>
        </form>
      </div>
    </div>
  );
}
