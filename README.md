# AR Traders POS - Franchise Management System

A full-stack Point of Sale (POS) MVP web application built for managing a cold-drink franchise business. This system provides a comprehensive dashboard for inventory control, order processing, delivery management, and real-time business analytics.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS v4, TypeScript, Axios, Recharts, React-Hot-Toast
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Authentication**: JWT (Access & Refresh Tokens), bcrypt
- **Media Storage**: Cloudinary integration for scalable product image uploads
- **Invoicing**: Browser-side client PDF generation (`jspdf`)
- **Optimization**: Lean Mongoose queries & rigorous React rendering safety patterns

## ✨ Key Features

- **Role-Based Access Control (RBAC)**: Secure segmented views for Administrative staff, Salesmen, and Delivery executives.
- **Inventory Management**: Real-time stock counting, low-threshold alarms, automated deduction, and immutable history logs.
- **Pipeline Order System**: Multi-stage order routing (Pending → Confirmed → In-Transit → Delivered) with dynamic stock validation.
- **Analytics Engine**: Complete MongoDB-aggregated dashboard indicating revenue performance metrics, volume sales, and 30-day graphical trends.
- **Advanced Invoicing**: On-demand downloadable receipt rendering.

## 📦 Local Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (`mongodb://localhost:27017`) or Cloud Atlas.
- Cloudinary developer credentials.

### 1. Clone & Install Dependencies
First, install the backend services:
```bash
cd backend
npm install
```

Then, set up the frontend workspace:
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/frenchise-pos
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here

# Cloudinary Integration
CLOUDINARY_CLOUD_NAME=_____
CLOUDINARY_API_KEY=_________
CLOUDINARY_API_SECRET=_________
```

*(Note: Create a `.env.local` inside `/frontend` pointing to your backend `NEXT_PUBLIC_API_URL=http://localhost:5000/api`)*

### 3. Initialize & Seed Database
Reset your environments and populate the default superuser:
```bash
cd backend
node seed.js
```
*Default Root Credentials:*
- Email: `admin@french.com`
- Password: `admin`

### 4. Run the Dev Servers
```bash
# In the /backend terminal
npm run dev

# In the /frontend terminal
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the live dashboard.

## 🔒 Access Roles Matrix

| Role | Capabilities |
| :--- | :--- |
| **Admin** | Unrestricted access across catalogs, POS logs, global invoices, users, settings, and business analytics. |
| **Salesman** | Localized dashboard restricted to their self-generated leads, processing incoming orders, and managing their tracked invoices. |
| **Deliverer** | Pure logistical readout tracking orders transitioned into 'In-Transit' requiring confirmation checkpoints. |

## 📐 Architecture Patterns

- **Lean Aggregations**: The backend strictly serves Mongoose models projected into localized POJOs (`.lean()`) to vastly decrease server response latency.
- **Client Safety Boundaries**: Advanced Typescript presence chaining acts as a fail-safe fallback across mapped react data structures parsing deep-nested array sub-documents.

---

*Designed natively for AR Traders operational deployment.*
