"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { orderService } from "@/services/orderService";
import { customerService } from "@/services/customerService";
import { productService } from "@/services/productService";
import { inventoryService } from "@/services/inventoryService";
import { Customer, Product, InventoryItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";

interface OrderLine {
  product: string;
  name: string;
  quantity: number;
  unitPrice: number;
  maxStock: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<OrderLine[]>([]);

  useEffect(() => {
    customerService.getAll({ limit: 200 }).then((res) => setCustomers(res.data.data)).catch(() => {});
    productService.getAll({ limit: 200 }).then((res) => setProducts(res.data.data)).catch(() => {});
    inventoryService.getAll({ limit: 200 }).then((res) => setInventory(res.data.data)).catch(() => {});
  }, []);

  const addLine = () => setLines([...lines, { product: "", name: "", quantity: 1, unitPrice: 0, maxStock: 0 }]);

  const updateLine = (index: number, field: string, value: string | number) => {
    const updated = [...lines];
    if (field === "product") {
      const prod = products.find((p) => p._id === value);
      const inv = inventory.find((i) => i.product?._id === value);
      updated[index] = {
        ...updated[index],
        product: value as string,
        name: prod?.name || "",
        unitPrice: prod?.unitPrice || 0,
        maxStock: inv?.currentStock || 0,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value } as OrderLine;
    }
    setLines(updated);
  };

  const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));

  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { toast.error("Select a customer"); return; }
    if (lines.length === 0) { toast.error("Add at least one product"); return; }
    for (const l of lines) {
      if (!l.product || l.quantity <= 0) { toast.error("Fill all product lines properly"); return; }
      if (l.quantity > l.maxStock) { toast.error(`Insufficient stock for ${l.name}`); return; }
    }

    setLoading(true);
    try {
      await orderService.create({
        customer: customerId,
        items: lines.map((l) => ({ product: l.product, name: l.name, quantity: l.quantity, unitPrice: l.unitPrice })),
        paymentMethod,
        notes,
      });
      toast.success("Order created!");
      router.push("/dashboard/orders");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={() => router.back()} className="btn-ghost mb-4"><HiOutlineArrowLeft className="w-5 h-5" /> Back</button>

      <div className="glass-card-solid p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create New Order</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Customer *</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="input-field">
                <option value="">Select Customer</option>
                {customers.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field">
                <option value="cash">Cash</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          </div>

          {/* Order Lines */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="input-label mb-0">Products *</label>
              <button type="button" onClick={addLine} className="btn-ghost text-sm text-primary"><HiOutlinePlus className="w-4 h-4" /> Add Item</button>
            </div>

            {lines.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
                <p className="text-slate-400 text-sm">No items added. Click &ldquo;Add Item&rdquo; above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lines.map((line, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                    <div className="flex-1 w-full">
                      <label className="text-xs text-slate-500 mb-1 block">Product</label>
                      <select value={line.product} onChange={(e) => updateLine(index, "product", e.target.value)} className="input-field text-sm">
                        <option value="">Select...</option>
                        {products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="text-xs text-slate-500 mb-1 block">Qty (max: {line.maxStock})</label>
                      <input type="number" min="1" max={line.maxStock} value={line.quantity} onChange={(e) => updateLine(index, "quantity", parseInt(e.target.value) || 0)} className="input-field text-sm" />
                    </div>
                    <div className="w-28">
                      <label className="text-xs text-slate-500 mb-1 block">Price</label>
                      <input type="number" value={line.unitPrice} onChange={(e) => updateLine(index, "unitPrice", parseFloat(e.target.value) || 0)} className="input-field text-sm" />
                    </div>
                    <div className="w-28 text-right">
                      <label className="text-xs text-slate-500 mb-1 block">Total</label>
                      <p className="py-2.5 font-semibold text-sm text-slate-900 dark:text-white">{formatCurrency(line.quantity * line.unitPrice)}</p>
                    </div>
                    <button type="button" onClick={() => removeLine(index)} className="p-2 text-slate-400 hover:text-error transition-colors">
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          {lines.length > 0 && (
            <div className="flex justify-end">
              <div className="text-right space-y-1">
                <p className="text-sm text-slate-500">Subtotal: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span></p>
                <p className="text-lg font-bold text-primary">{formatCurrency(subtotal)}</p>
              </div>
            </div>
          )}

          <div>
            <label className="input-label">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field resize-none" rows={2} placeholder="Optional notes..." />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating..." : "Create Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
