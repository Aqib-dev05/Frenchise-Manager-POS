import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AR Traders POS — Cold-Drink Franchise Management",
  description:
    "Manage inventory, orders, and deliveries for AR Traders cold-drink franchise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`antialiased ${inter.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "14px",
                },
                success: {
                  style: {
                    background: "#0f172a",
                    color: "#f1f5f9",
                    border: "1px solid #10b981",
                  },
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#f1f5f9",
                  },
                },
                error: {
                  style: {
                    background: "#0f172a",
                    color: "#f1f5f9",
                    border: "1px solid #ef4444",
                  },
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#f1f5f9",
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
