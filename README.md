# 🏫 Where is My Classroom — มหาวิทยาลัยขอนแก่น

ระบบค้นหาห้องเรียนและนำทางภายในมหาวิทยาลัยขอนแก่น

## Tech Stack
- **Backend**: FastAPI (Python) + PostgreSQL + SQLAlchemy
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Auth**: Google OAuth2
- **Maps**: Google Maps JavaScript API
- **Weather**: Open-Meteo API
- **Deploy**: Render

---

## 🚀 Quick Start (Local Dev)

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+

### 1. Clone & Setup Backend
```bash
cd backend
cp .env.example .env
# แก้ไข .env ใส่ Google credentials และ DB URL
pip install -r requirements.txt
python -m app.seed   # สร้าง tables และ seed ข้อมูล
uvicorn app.main:app --reload
```

### 2. Setup Frontend
```bash
cd frontend
cp .env.example .env
# แก้ไข .env ใส่ VITE_GOOGLE_CLIENT_ID และ VITE_GOOGLE_MAPS_API_KEY
npm install
npm run dev
```

เปิด http://localhost:5173

---

## 🐳 Docker Compose

```bash
cp backend/.env.example .env
# ใส่ค่า GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_MAPS_API_KEY ใน .env

docker-compose up --build
```

เปิด http://localhost

---

## ☁️ Deploy to Render.com

1. Push code ขึ้น GitHub
2. ไปที่ [render.com](https://render.com) → New → Blueprint
3. เลือก repo และใช้ `render.yaml`
4. กำหนด Environment Variables ในแต่ละ service:

### Backend Environment Variables
| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | จาก Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | จาก Google Cloud Console |
| `GOOGLE_MAPS_API_KEY` | จาก Google Cloud Console |
| `ADMIN_SEED_EMAIL` | อีเมล KKU ของ Admin เช่น `yourname@kku.ac.th` |
| `FRONTEND_URL` | URL ของ frontend เช่น `https://wimc-frontend.onrender.com` |

### Frontend Environment Variables
| Key | Value |
|-----|-------|
| `VITE_GOOGLE_CLIENT_ID` | เดียวกับ backend |
| `VITE_GOOGLE_MAPS_API_KEY` | เดียวกับ backend |
| `VITE_API_URL` | `https://wimc-backend.onrender.com/api` |

---

## 🔑 Google Cloud Setup

### OAuth2 Setup
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่
3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
4. Authorized JavaScript origins: `http://localhost:5173`, `https://your-frontend.onrender.com`
5. Authorized redirect URIs: (ไม่จำเป็น — ใช้ client-side flow)

### Maps API Setup
1. APIs & Services → Enable APIs:
   - Maps JavaScript API
   - Places API
2. Create API Key → Restrict to HTTP referrers

---

## 📋 Features

| Feature | FR | สถานะ |
|---------|-----|--------|
| Login ด้วย KKU Mail | FR-01 | ✅ |
| Logout | FR-02 | ✅ |
| แสดงแผนที่ Google Maps | FR-03 | ✅ |
| คลิกอาคารบนแผนที่ | FR-04 | ✅ |
| แสดงห้องเรียนทั้งหมดในอาคาร | FR-05 | ✅ |
| แสดงรูปภาพห้องเรียน | FR-06 | ✅ |
| นำเข้าตารางเรียน .ics | FR-07 | ✅ |
| แสดงห้องเรียนวันนี้ | FR-08 | ✅ |
| ค้นหาห้องเรียน | FR-09 | ✅ |
| แก้ไขห้องเรียน (Make-up) | FR-10 | ✅ |
| แจ้งเตือนก่อนเรียน (in-app) | FR-11 | ✅ |
| เปิด/ปิดการแจ้งเตือน | FR-12 | ✅ |
| Admin จัดการข้อมูล | FR-13 | ✅ |
| เปลี่ยนภาษา TH/EN | FR-14 | ✅ |
| ประวัติการค้นหา | FR-15 | ✅ |

## 🌐 External Web Services
1. **Google Maps API** — แผนที่และข้อมูล Place
2. **Open-Meteo API** — สภาพอากาศ Khon Kaen (ฟรี ไม่ต้อง API Key)

---

## 👤 Admin Login

Admin ถูก seed อัตโนมัติจาก `ADMIN_SEED_EMAIL` ใน `.env`
Login ด้วย Google OAuth ด้วยอีเมลนั้น แล้วจะเข้า Admin Panel ได้ทันที

---

## 📁 Project Structure

```
where-is-my-classroom/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── config.py            # Settings (.env)
│   │   ├── database.py          # SQLAlchemy engine
│   │   ├── models/              # Domain models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── repositories/        # Data Access Layer
│   │   ├── services/            # Business Logic Layer
│   │   │   ├── auth_service.py  # Google OAuth + JWT
│   │   │   ├── schedule_service.py  # ICS parsing
│   │   │   └── weather_service.py   # Open-Meteo API
│   │   ├── controllers/         # Presentation Layer (Routes)
│   │   └── seed.py              # Initial data seeding
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client (axios)
│   │   ├── context/             # React Context (Auth)
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── i18n/                # TH/EN translations
│   │   └── utils/               # Notifications, helpers
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── render.yaml
└── README.md
```
