<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

<h1 align="center">📦 Stokku - Professional Inventory System</h1>

<p align="center">
  <strong>Efficiently track, manage, and optimize your warehouse operations.</strong><br>
  Built with a modern stack to handle real-world supply chain challenges.
</p>

---

## 🌟 High-Level Features

* **📊 Real-time Dashboard**: Visualized analytics for stock movements and low-inventory alerts.
* **🛡️ Enterprise-Grade Security**: Role-Based Access Control (RBAC) for Admin, Manager, and Staff levels.
* **📑 Smart Inventory Control**: Intelligent "Stock In" and "Stock Out" workflows with automated reason tracking.
* **🔍 OCR-Powered Entry**: Optical Character Recognition to extract product data from images—minimizing manual entry errors.
* **📈 Advanced Reporting**: Export data-rich inventory logs to `.xlsx` format for stakeholder reviews.
* **⚡ Modern Architecture**: Leveraging **Vue 3 (Pinia)** for a reactive frontend and **Express (TypeScript)** for a robust backend.

## 🛠️ Tech Stack

### **Frontend (Client)**
- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Tools**: Vite, ExcelJS

### **Backend (API)**
- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Structured Relational Data)
- **Authentication**: JWT & Bcrypt
- **Storage**: Multer for Local File System management

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Instance

### 2. Environment Setup
Create a `.env` file in the `backend` directory:
```env
PORT=3001
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=stokku_db
JWT_SECRET=super_secret_key

# Install dependencies for both environments
cd backend && npm install
cd ../frontend && npm install

# Navigate to backend
npm run reset   # Warning: Drops existing tables
npm run seed    # Populates initial data

🔑 Access Credentials (Seed Data)RoleUsername / EmailPasswordAdministratoradmin@stokku.compassword123Warehouse Managermanager@stokku.compassword123Operational Staffstaff@stokku.compassword123
