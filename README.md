# 🛒 MARKETA - Supermarket Management System

> A comprehensive, modern, full-stack MERN application for managing supermarket operations including inventory, sales, purchases, customers, suppliers, reports, and real-time dashboard analytics.

---

## 📸 Overview & Features

**MARKETA** is designed to streamline day-to-day retail and supermarket management. It provides role-based authentication, real-time inventory tracking, point of sale transaction capabilities, supplier and customer relationship management, and actionable analytics.

### Key Features
- 📊 **Dashboard & Analytics:** Summary of revenue, daily sales, top products, low stock alerts, and financial metrics.
- 📦 **Inventory & Product Management:** Categorize products, track stock levels, barcoding/SKU management, and maintain stock history.
- 💰 **Sales & POS System:** Quick bill generation, customer attachment, discount application, and automated invoice creation.
- 🛒 **Purchase & Supplier Management:** Manage vendors, place purchase orders, and track stock replenishment.
- 👥 **Customer Management:** Track customer purchase history and credit/loyalty information.
- 🔔 **Notifications & Alerts:** Automatic notifications for low inventory stock and pending payments.
- 📈 **Reports & Exports:** Detailed financial, inventory, and sales performance reports.
- 🔒 **Security & Auth:** JWT authentication, encrypted passwords via `bcryptjs`, and protected middleware routes.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology / Package |
| :--- | :--- |
| **Frontend** | React, React Router, Context API / Redux, Axios, CSS / Tailwind |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **File Uploads** | `multer` |

---

## 📂 Project Directory Structure

```
marketa-supermarket/
├── package.json               # Root scripts for running frontend & backend concurrently
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection setup
│   ├── controllers/           # API request handlers (Auth, Sales, Inventory, etc.)
│   ├── middlewares/           # Auth validation, file upload, error handling
│   ├── models/                # Mongoose schemas (User, Product, Sale, Purchase, etc.)
│   └── routes/                # Express API endpoint definitions
└── frontend/                  # React Single Page Application (SPA)
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js** (v14.x or higher)
- **npm** or **yarn**
- **MongoDB** instance (Local or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/marketa-supermarket.git
cd marketa-supermarket
```

### 2. Install All Dependencies
Execute the convenience root script to install both backend and frontend packages:
```bash
npm run install:all
```

### 3. Environment Variables
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/marketa_db
JWT_SECRET=your_super_secret_jwt_key
```

### 4. Run Development Servers
To start both the Backend API server and Frontend development server concurrently:
```bash
npm run dev
```

Or run them individually in separate terminal sessions:
```bash
# Start Backend (Port 5000)
npm run backend

# Start Frontend
npm run frontend
```

---

## 📜 Available Scripts

From the root directory, you can run:

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | Starts frontend & backend concurrently |
| `npm run backend` | `cd backend && npm run dev` | Runs Express server with `nodemon` |
| `npm run frontend` | `cd frontend && npm run dev` | Starts React dev server |
| `npm run install:all` | Installs dependencies for both projects |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check out the [issues page](../../issues) if you want to contribute.

---

## 📄 License

This project is licensed under the **ISC License**.
