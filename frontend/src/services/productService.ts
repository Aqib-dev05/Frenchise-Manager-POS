import api from "@/lib/api";

export const productService = {
  getAll: (params?: Record<string, string | number>) => api.get("/products", { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (formData: FormData) =>
    api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, formData: FormData) =>
    api.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string) => api.delete(`/products/${id}`),
};
