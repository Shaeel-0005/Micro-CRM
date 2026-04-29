# Micro CRM 🚀

A lightweight CRM (Customer Relationship Management) tool built for small businesses to manage leads, track pipelines, and set reminders — all in one place.

<img width="1887" height="952" alt="Screenshot 2026-04-29 183032" src="https://github.com/user-attachments/assets/6277a066-928b-4328-a76e-651fd9cc274f" />

![Django](https://img.shields.io/badge/Django-6.0-green?style=flat-square&logo=django)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)
![AWS EC2](https://img.shields.io/badge/AWS-EC2-orange?style=flat-square&logo=amazonaws)
![License](https://img.shields.io/badge/license-MIT-brightgreen?style=flat-square)

## 🌐 Live Demo

- **Frontend:** https://micro-crm-ten.vercel.app
- **Backend API:** https://leadflow.duckdns.org/api

---

## ✨ Features

- 🔐 JWT Authentication (signup, login, token refresh)
- 📋 Lead management with status pipeline (Kanban-style)
- 📬 Inbox with reminders and follow-ups
- 📊 Analytics and reports
- 👥 Contacts management
- 🔔 Celery-powered background tasks for due reminders

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Axios | HTTP client |
| React Router | Client-side routing |
| Tailwind CSS | Styling |
| Vercel | Hosting & deployment |

### Backend
| Technology | Purpose |
|---|---|
| Django 6.0 | Web framework |
| Django REST Framework | API layer |
| Simple JWT | Authentication |
| Celery + Redis | Background tasks |
| PostgreSQL | Database |
| Gunicorn | WSGI server |
| Nginx | Reverse proxy |
| AWS EC2 | Hosting (free tier) |
| Let's Encrypt | SSL/HTTPS |

---

## 🏗️ Architecture

```
Browser (Vercel)
      │
      │ HTTPS
      ▼
   Nginx (port 443)
      │
      │ Unix socket
      ▼
  Gunicorn (3 workers)
      │
      ▼
  Django App
      │
      ├──▶ PostgreSQL (database)
      └──▶ Redis (Celery broker)
```

---

## 🚀 Local Development

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL
- Redis

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/Shaeel-0005/Micro-CRM.git
cd Micro-CRM/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Fill in your environment variables

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

### Frontend Setup

```bash
cd Micro-CRM/frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
```

---

## ⚙️ Environment Variables

### Backend `.env`
```env
SECRET_KEY=your-django-secret-key
ALLOWED_HOSTS=localhost,your-domain.com
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379/0
CORS_ORIGINS=http://localhost:5173
DJANGO_SETTINGS_MODULE=leadflow.settings.development
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🔄 CI/CD

This project uses **GitHub Actions** for automated deployment. Every push to `main` automatically:

1. SSHs into the EC2 instance
2. Pulls the latest code
3. Installs new dependencies
4. Runs database migrations
5. Collects static files
6. Restarts the Gunicorn service

---

## 📁 Project Structure

```
Micro-CRM/
├── backend/
│   ├── apps/
│   │   ├── users/
│   │   ├── leads/
│   │   ├── reminders/
│   │   └── analytics/
│   ├── leadflow/
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## 👨‍💻 Author

**Shaeel** — Self-taught developer building in public.

- GitHub: [@Shaeel-0005](https://github.com/Shaeel-0005)

---

## 📄 License

MIT License — feel free to use this project as a reference or starting point.
