# Stokku App - Inventory Management System

Stokku is a modern web-based inventory management application designed to help businesses manage product stock, track incoming and outgoing goods, and generate comprehensive inventory reports efficiently.

## 🚀 Key Features

- **Interactive Dashboard**: Summary statistics, stock trend charts, and recent activity logs.
- **Product Management**: Full CRUD operations for products, image uploads, categories, and supplier management.
- **Stock Control**: Record Stock In and Stock Out transactions with specific reasons (e.g., purchase, sale, damage).
- **Reports & Export**: Generate detailed inventory reports with export functionality to Excel (.xlsx).
- **User Management**: Role-based access control (Admin, Manager, Staff).
- **Low Stock Alerts**: Automatic warnings for products reaching minimum stock thresholds.
- **OCR Integration**: Scan product images to extract text and automatically fill product details.

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Auth**: JWT (JSON Web Token)
- **File Upload**: Multer

### Frontend

- **Framework**: Vue 3
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API Wrapper
- **Export**: ExcelJS, FileSaver

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org/) (v16 or later)
- [PostgreSQL](https://www.postgresql.org/)

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ikhwanand/stokku-app.git
cd stokku-app
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder and configure your database settings:

```env
PORT=3001
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stokku_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
```

Run database migration and seeding:

```bash
# Database setup
npm run reset # Caution: This will drop existing tables
# Or run manually:
# npm run migrate
# npm run seed
```

Start the backend server:

```bash
npm run dev
```

The server will run on `http://localhost:3001`.

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env` file (optional if defaults differ):

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

Start the frontend server:

```bash
npm run dev
```

Access the application at `http://localhost:5173`.

## 🔑 Demo Accounts (Seed Data)

After running `npm run seed`, you can log in with the following default accounts:

| Role        | Email              | Password      |
| ----------- | ------------------ | ------------- |
| **Admin**   | admin@stokku.com   | `password123` |
| **Manager** | manager@stokku.com | `password123` |
| **Staff**   | staff@stokku.com   | `password123` |

## 📂 Project Structure

```
stokku-app/
├── backend/         # Express API Server
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/      # Database config & scripts
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   └── uploads/     # Product image storage
│
└── frontend/        # Vue 3 Client
    ├── src/
    │   ├── components/
    │   ├── layouts/
    │   ├── pages/
    │   ├── router/
    │   ├── services/
    │   ├── stores/
    │   └── types/
    └── vite.config.ts
```

## 📝 Implementation Notes

- **Proxy**: The frontend uses Vite proxy configuration (`/api` and `/uploads`) to avoid CORS issues during development.
- **Image Upload**: Images are stored on the local server (`backend/uploads`) and served as static files.

---

Made with ❤️ by the Stokku Dev Team.
