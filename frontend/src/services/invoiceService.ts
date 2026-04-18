import api from "@/lib/api";

export const invoiceService = {
  getAll: (params?: Record<string, string | number>) => api.get("/invoices", { params }),
  getByOrder: (orderId: string) => api.get(`/invoices/${orderId}`),
};
