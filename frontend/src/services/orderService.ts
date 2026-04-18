import api from "@/lib/api";

export const orderService = {
  getAll: (params?: Record<string, string | number>) => api.get("/orders", { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: {
    customer: string;
    items: { product: string; name: string; quantity: number; unitPrice: number }[];
    paymentMethod?: string;
    notes?: string;
    taxRate?: number;
  }) => api.post("/orders", data),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
  assignDeliverer: (id: string, delivererId: string) =>
    api.put(`/orders/${id}/assign`, { delivererId }),
};
