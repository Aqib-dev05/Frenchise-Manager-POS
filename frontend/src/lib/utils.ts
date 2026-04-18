export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "in-transit": "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
};

export const CATEGORY_OPTIONS = [
  { value: "cola", label: "Cola" },
  { value: "juice", label: "Juice" },
  { value: "energy-drink", label: "Energy Drink" },
  { value: "water", label: "Water" },
  { value: "soda", label: "Soda" },
  { value: "tea", label: "Tea" },
  { value: "other", label: "Other" },
];

export const UNIT_OPTIONS = [
  { value: "bottle", label: "Bottle" },
  { value: "can", label: "Can" },
  { value: "crate", label: "Crate" },
  { value: "pack", label: "Pack" },
  { value: "carton", label: "Carton" },
];

export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "salesman", label: "Salesman" },
  { value: "deliverer", label: "Deliverer" },
];
