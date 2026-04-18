// ==================== User ====================
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "salesman" | "deliverer";
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ==================== Product ====================
export interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string;
  sku: string;
  unit: string;
  unitPrice: number;
  imageUrl: string;
  imagePublicId?: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

// ==================== Inventory ====================
export interface InventoryItem {
  _id: string;
  product: Product;
  currentStock: number;
  minThreshold: number;
  lastUpdated: string;
}

// ==================== StockLog ====================
export interface StockLog {
  _id: string;
  product: { _id: string; name: string; sku: string };
  type: "in" | "out";
  quantity: number;
  reason: string;
  supplierName?: string;
  costPrice?: number;
  performedBy: { _id: string; name: string; role: string };
  createdAt: string;
}

// ==================== Customer ====================
export interface Customer {
  _id: string;
  name: string;
  phone: string;
  address: string;
  createdBy: { _id: string; name: string };
  createdAt: string;
}

// ==================== Order ====================
export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  status: "pending" | "confirmed" | "in-transit" | "delivered" | "cancelled";
  paymentMethod: "cash" | "credit";
  assignedTo?: { _id: string; name: string; email?: string };
  createdBy: { _id: string; name: string; email?: string };
  invoiceUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Invoice ====================
export interface Invoice {
  _id: string;
  order: Order;
  invoiceNumber: string;
  pdfUrl: string;
  generatedAt: string;
}

// ==================== API ====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

// ==================== Analytics ====================
export interface DashboardData {
  totalRevenue: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  totalOrders: number;
  topProducts: { _id: string; name: string; totalQty: number; totalRevenue: number }[];
  revenueByDay: { _id: string; revenue: number; orders: number }[];
  ordersByStatus: { _id: string; count: number }[];
  lowStockCount: number;
  activeUsers: number;
}
