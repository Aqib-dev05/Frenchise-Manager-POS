import api from "@/lib/api";

export const userService = {
  getAll: (params?: Record<string, string | number>) => api.get("/users", { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: { name: string; email: string; password: string; role: string }) =>
    api.post("/users", data),
  update: (
    id: string,
    data: { name?: string; email?: string; role?: string; isActive?: boolean; password?: string }
  ) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};
