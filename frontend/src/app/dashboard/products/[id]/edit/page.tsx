"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { productService } from "@/services/productService";
import { CATEGORY_OPTIONS, UNIT_OPTIONS } from "@/lib/utils";
import toast from "react-hot-toast";
import { HiOutlineArrowLeft, HiOutlinePhotograph } from "react-icons/hi";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", category: "other", brand: "", sku: "", unit: "bottle", unitPrice: "", description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    productService.getById(id).then((res) => {
      const p = res.data.data;
      setFormData({
        name: p.name, category: p.category, brand: p.brand, sku: p.sku,
        unit: p.unit, unitPrice: String(p.unitPrice), description: p.description || "",
      });
      if (p.imageUrl) setImagePreview(p.imageUrl);
    }).catch(() => toast.error("Failed to load product"))
    .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => fd.append(key, val));
      if (imageFile) fd.append("image", imageFile);
      await productService.update(id, fd);
      toast.success("Product updated!");
      router.push("/dashboard/products");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Update failed");
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => router.back()} className="btn-ghost mb-4">
        <HiOutlineArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="glass-card-solid p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Product Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="input-label">Brand *</label>
              <input name="brand" value={formData.brand} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="input-label">SKU *</label>
              <input name="sku" value={formData.sku} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="input-label">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Unit</label>
              <select name="unit" value={formData.unit} onChange={handleChange} className="input-field">
                {UNIT_OPTIONS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Unit Price (PKR) *</label>
            <input name="unitPrice" type="number" min="0" step="0.01" value={formData.unitPrice} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="input-label">Product Image</label>
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-primary transition-colors bg-slate-50 dark:bg-slate-800/30">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-auto rounded-lg object-contain p-2" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <HiOutlinePhotograph className="w-10 h-10 mb-2" />
                  <span className="text-sm">Click to upload</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</> : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
