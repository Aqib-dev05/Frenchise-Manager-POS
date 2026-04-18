"use client";

import { useEffect, useState } from "react";
import { invoiceService } from "@/services/invoiceService";
import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { HiOutlineDownload, HiOutlineDocumentText } from "react-icons/hi";
import { jsPDF } from "jspdf";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    invoiceService.getAll({ page, limit: 10 }).then((res) => {
      setInvoices(res.data.data);
      setPagination(res.data.pagination);
    }).catch(() => toast.error("Failed to load invoices")).finally(() => setLoading(false));
  }, [page]);

  const generatePDF = (invoice: Invoice) => {
    const order = invoice.order;
    if (!order) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header gradient
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("AR Traders", 20, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Cold-Drink Franchise", 20, 30);

    // Invoice info
    doc.setFontSize(12);
    doc.text(`Invoice: ${invoice.invoiceNumber}`, pageWidth - 20, 18, { align: "right" });
    doc.setFontSize(9);
    doc.text(`Date: ${formatDate(invoice.generatedAt)}`, pageWidth - 20, 26, { align: "right" });
    doc.text(`Order: ${order.orderNumber}`, pageWidth - 20, 33, { align: "right" });

    // Reset text color
    doc.setTextColor(15, 23, 42);
    let y = 55;

    // Customer info
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y += 8;
    doc.text(order.customer?.name || "N/A", 20, y);
    y += 6;
    doc.text(order.customer?.phone || "", 20, y);
    y += 6;
    doc.text(order.customer?.address || "", 20, y);

    y += 15;

    // Table header
    doc.setFillColor(241, 245, 249);
    doc.rect(20, y, pageWidth - 40, 10, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Product", 25, y + 7);
    doc.text("Qty", 110, y + 7, { align: "right" });
    doc.text("Unit Price", 140, y + 7, { align: "right" });
    doc.text("Total", pageWidth - 25, y + 7, { align: "right" });

    y += 14;
    doc.setFont("helvetica", "normal");

    order.items?.forEach((item) => {
      doc.text(item.name || "Product", 25, y);
      doc.text(String(item.quantity), 110, y, { align: "right" });
      doc.text(`PKR ${item.unitPrice.toFixed(2)}`, 140, y, { align: "right" });
      doc.text(`PKR ${(item.quantity * item.unitPrice).toFixed(2)}`, pageWidth - 25, y, { align: "right" });
      y += 8;
    });

    // Totals
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(110, y, pageWidth - 20, y);
    y += 8;

    doc.text("Subtotal:", 120, y);
    doc.text(`PKR ${order.totalAmount?.toFixed(2)}`, pageWidth - 25, y, { align: "right" });

    if (order.taxAmount > 0) {
      y += 7;
      doc.text("Tax:", 120, y);
      doc.text(`PKR ${order.taxAmount.toFixed(2)}`, pageWidth - 25, y, { align: "right" });
    }

    y += 9;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Grand Total:", 120, y);
    doc.setTextColor(99, 102, 241);
    doc.text(`PKR ${order.grandTotal?.toFixed(2)}`, pageWidth - 25, y, { align: "right" });

    // Payment method
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    y += 15;
    doc.text(`Payment Method: ${order.paymentMethod?.toUpperCase() || "CASH"}`, 20, y);

    // Footer
    doc.setFontSize(8);
    doc.text("Thank you for your business! — AR Traders", pageWidth / 2, 280, { align: "center" });

    doc.save(`${invoice.invoiceNumber}.pdf`);
    toast.success("Invoice downloaded!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h2>

      <div className="glass-card-solid overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 skeleton rounded-lg" />)}</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <HiOutlineDocumentText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 text-lg font-medium">No invoices yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Invoice #</th><th>Order #</th><th>Customer</th><th>Amount</th><th>Date</th><th>Download</th></tr></thead>
              <tbody>
                {invoices?.map((inv) => (
                  <tr key={inv._id}>
                    <td className="font-semibold text-primary dark:text-primary-light">{inv?.invoiceNumber}</td>
                    <td>{inv?.order?.orderNumber}</td>
                    <td>{inv?.order?.customer?.name}</td>
                    <td className="font-medium">{formatCurrency(inv?.order?.grandTotal || 0)}</td>
                    <td className="text-sm">{formatDate(inv?.generatedAt)}</td>
                    <td>
                      <button onClick={() => generatePDF(inv)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                        <HiOutlineDownload className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-ghost text-sm disabled:opacity-30">Previous</button>
          <span className="text-sm text-slate-500">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(Math.min(pagination.pages, page + 1))} disabled={page === pagination.pages} className="btn-ghost text-sm disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}
