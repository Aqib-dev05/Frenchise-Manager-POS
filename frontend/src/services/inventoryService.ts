import api from "@/lib/api";

export const inventoryService = {
  getAll: (params?: Record<string, string | number>) => api.get("/inventory", { params }),
  update: (productId: string, data: { minThreshold: number }) =>
    api.put(`/inventory/${productId}`, data),
  stockIn: (data: {
    productId: string;
    quantity: number;
    supplierName?: string;
    costPrice?: number;
    reason?: string;
  }) => api.post("/inventory/stock-in", data),
  getLogs: (params?: Record<string, string | number>) => api.get("/inventory/logs", { params }),
  getLowStock: () => api.get("/inventory/low-stock"),
  exportCSV: () => api.get("/inventory/export-csv", { responseType: "blob" }),
};
