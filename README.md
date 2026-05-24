# ⚡ StoraX — Multi-Tenant Object Storage & Billing Engine

> A production-grade cloud storage platform with real-time usage metering and automatic billing — built like AWS S3 from scratch.

![StoraX](https://img.shields.io/badge/StoraX-v1.0.0-6C63FF?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)
![MinIO](https://img.shields.io/badge/MinIO-S3-C72E49?style=for-the-badge)

---

## 🚀 What is StoraX?

StoraX is a **multi-tenant object storage service** that behaves like a real cloud storage product:

- 👤 Multiple users can upload, access, and manage objects
- 🔒 Each user's data is **strictly isolated** in their own S3 bucket
- 📊 Real usage is **measured automatically** (storage, bandwidth, API calls)
- 💳 A **usage-based bill** is generated per user with PDF invoices

---

## 🏗️ Architecture
User → React Frontend (Vercel)
↓
FastAPI Backend (Railway)
├── Auth Service (JWT + bcrypt)
├── Storage Service → MinIO (S3-compatible)
├── Metering Service → PostgreSQL
└── Billing Service → PDF Generation

---

## ✨ Features

### 🗄️ Multi-Tenant Storage
- Every user gets an isolated S3-compatible bucket
- Upload, download, delete files with drag & drop
- File type detection and preview icons

### 📊 Real-time Metering
- Every API call logged (UPLOAD, DOWNLOAD, DELETE, LIST)
- Storage bytes tracked per object
- Bandwidth measured per transfer

### 💳 Automatic Billing Engine
- Usage-based pricing (storage + requests + bandwidth)
- Monthly invoices auto-generated
- Professional PDF invoice download

### 👑 Admin Dashboard
- Platform-wide stats (users, files, revenue)
- Per-user storage and request monitoring
- Real-time data tables

---

## 💰 Pricing Model

| Service | Rate |
|---------|------|
| Storage | $0.02 per GB/month |
| API Requests | $0.01 per 1,000 requests |
| Bandwidth | $0.09 per GB transferred |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Recharts |
| Backend | Python FastAPI |
| Database | PostgreSQL 15 |
| Object Storage | MinIO (S3-compatible) |
| Auth | JWT + bcrypt |
| PDF Generation | ReportLab |
| Containerization | Docker Compose |

---

## ⚡ Quick Start

### Prerequisites
- Docker Desktop
- Python 3.11+
- Node.js 18+

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/storax.git
cd storax
```

### 2. Start infrastructure
```bash
docker-compose up -d
```

### 3. Start backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Start frontend
```bash
cd frontend/storax
npm install
npm start
```

### 5. Open in browser
- **App**: http://localhost:3000
- **API Docs**: http://localhost:8000/api/docs
- **MinIO Console**: http://localhost:9001

---

## 📁 Project Structure
storax/
├── backend/
│   ├── app/
│   │   ├── models/        # Database models
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── config.py      # Settings
│   │   ├── database.py    # DB connection
│   │   └── main.py        # FastAPI app
│   └── requirements.txt
├── frontend/
│   └── storax/
│       └── src/
│           ├── pages/     # React pages
│           ├── components/ # Shared components
│           ├── context/   # Auth context
│           └── api/       # Axios config
└── docker-compose.yml

---

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |

### Storage
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/storage/upload | Upload file |
| GET | /api/storage/files | List files |
| GET | /api/storage/download/{key} | Download file |
| DELETE | /api/storage/delete/{key} | Delete file |
| GET | /api/storage/usage | Usage stats |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/billing/current | Current bill |
| POST | /api/billing/generate | Generate invoice |
| GET | /api/billing/invoices | List invoices |
| GET | /api/billing/invoice/{id}/pdf | Download PDF |

---

## 👨‍💻 Built By

**Shravan Pawar** — Built for Zoho Internship Selection

---

*StoraX © 2026 — Production-grade cloud storage, built from scratch.*