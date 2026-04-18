import api from "@/lib/api";

export const analyticsService = {
  getDashboard: () => api.get("/analytics/dashboard"),
};
