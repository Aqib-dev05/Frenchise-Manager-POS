import api from "@/lib/api";

export const customerService = {
  getAll: (params?: Record<string, string | number>) => api.get("/customers", { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: { name: string; phone: string; address?: string }) =>
    api.post("/customers", data),
  update: (id: string, data: { name?: string; phone?: string; address?: string }) =>
    api.put(`/customers/${id}`, data),
};
