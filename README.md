# 🚀 LeadFlow Solo SaaS - Micro CRM

A modern, lightweight CRM system built with Django REST Framework and React. Perfect for solo entrepreneurs and small teams to manage leads, track opportunities, and close deals.

![Python](https://img.shields.io/badge/Python-3.13-blue)
![Django](https://img.shields.io/badge/Django-5.1-green)
![React](https://img.shields.io/badge/React-18-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Roadmap](#roadmap)

---

## ✨ Features

### **Phase 1: Foundation (Complete ✅)**
- 🔐 **JWT Authentication** - Secure user signup, login, and logout
- 👤 **User Management** - Extended user profiles with role-based access
- 📊 **Lead Management** - Complete CRUD operations for leads
- 🎯 **Lead Tracking** - Track status (New, Contacted, In Progress, Won, Lost)
- 🔍 **Advanced Filtering** - Filter by status, source, and search leads
- 📈 **Real-time Statistics** - Dashboard with lead metrics
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ✅ **Form Validation** - Client and server-side validation
- 🎉 **Success Notifications** - Animated toast messages

### **Phase 2: Coming Soon** 🚧
- 📝 Notes & Activity Tracking
- ⏰ Reminders & Follow-ups
- 📊 Advanced Analytics with Charts
- 📧 Email Integration

### **Phase 3: Future** 🔮
- 💳 Stripe Integration
- 🔔 Real-time Notifications (Celery + Redis)
- 🌐 Multi-tenant Support
- 📱 Mobile App

---

## 🛠️ Tech Stack

### **Backend**
- **Django 5.1** - Python web framework
- **Django REST Framework** - RESTful API toolkit
- **PostgreSQL 16** - Relational database
- **JWT Authentication** - Secure token-based auth
- **Python 3.13** - Programming language

### **Frontend**
- **React 18** - JavaScript library for UI
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client

### **Development Tools**
- **Git** - Version control
- **VS Code** - Code editor
- **Thunder Client** - API testing
- **PostgreSQL CLI** - Database management

---

## 📁 Project Structure

```
leadflow/
├── backend/
│   ├── manage.py
│   ├── leadflow/              # Django project config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── apps/
│   │   ├── users/             # Authentication & user management
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   │
│   │   ├── leads/             # Core CRM logic
│   │   │   ├── models.py      # Lead model
│   │   │   ├── views.py       # Lead ViewSet (CRUD)
│   │   │   ├── serializers.py # Lead serializers
│   │   │   └── urls.py
│   │   │
│   │   ├── analytics/         # Metrics & dashboards (future)
│   │   └── reminders/         # Follow-ups & tasks (future)
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LeadForm.jsx   # Add/Edit lead modal
│   │   │   └── ...
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   └── Login.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js         # API integration layer
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── docker-compose.yml         # Docker setup (future)
├── README.md
└── .gitignore
```

---

## 🚀 Installation

### **Prerequisites**
- Python 3.13+
- Node.js 18+
- PostgreSQL 16+
- Git

### **Step 1: Clone Repository**

```bash
git clone https://github.com/yourusername/leadflow-crm.git
cd leadflow-crm
```

### **Step 2: Backend Setup**

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create PostgreSQL database
psql -U postgres
CREATE DATABASE micro_crm_db;
\q

# Configure environment variables
# Create .env file in backend/ with:
DATABASE_NAME=micro_crm_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
SECRET_KEY=your-secret-key-here

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will run on: `http://127.0.0.1:8000`

### **Step 3: Frontend Setup**

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## 📚 API Documentation

### **Authentication Endpoints**

#### **Signup**
```http
POST /api/auth/signup/
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123",
  "password2": "securepass123"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "access": "eyJhbGc...",
  "refresh": "eyJhbGc..."
}
```

#### **Login**
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "access": "eyJhbGc...",
  "refresh": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

---

### **Lead Endpoints**

All lead endpoints require authentication. Include JWT token in headers:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### **Create Lead**
```http
POST /api/leads/
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "company": "Acme Corp",
  "status": "new",
  "source": "website",
  "notes": "Interested in enterprise plan"
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "company": "Acme Corp",
  "status": "new",
  "status_display": "New",
  "source": "website",
  "source_display": "Website",
  "notes": "Interested in enterprise plan",
  "created_at": "2026-01-07T10:30:00Z",
  "updated_at": "2026-01-07T10:30:00Z",
  "owner": 1
}
```

#### **List All Leads**
```http
GET /api/leads/
Authorization: Bearer YOUR_TOKEN

# Optional query parameters:
?status=new              # Filter by status
?source=website          # Filter by source
?search=acme            # Search in name, email, company
?ordering=-created_at   # Order by field
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "status": "new",
    "source": "website",
    "created_at": "2026-01-07T10:30:00Z"
  }
]
```

#### **Get Single Lead**
```http
GET /api/leads/{id}/
Authorization: Bearer YOUR_TOKEN
```

#### **Update Lead**
```http
PUT /api/leads/{id}/
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "John Doe",
  "email": "john@example.com",
  "status": "contacted"
}
```

#### **Partial Update Lead**
```http
PATCH /api/leads/{id}/
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "status": "in_progress"
}
```

#### **Delete Lead**
```http
DELETE /api/leads/{id}/
Authorization: Bearer YOUR_TOKEN
```

#### **Get Lead Statistics**
```http
GET /api/leads/stats/
Authorization: Bearer YOUR_TOKEN
```

**Response (200):**
```json
{
  "total": 10,
  "by_status": {
    "new": 4,
    "contacted": 2,
    "in_progress": 2,
    "won": 1,
    "lost": 1
  },
  "by_source": {
    "website": 5,
    "referral": 3,
    "linkedin": 2
  }
}
```

#### **Get Recent Leads**
```http
GET /api/leads/recent/
Authorization: Bearer YOUR_TOKEN
```

Returns last 10 leads.

---

## 💻 Development

### **Run Backend**
```bash
cd backend
python manage.py runserver
```

### **Run Frontend**
```bash
cd frontend
npm run dev
```

### **Run Migrations**
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### **Create Sample Data**
```bash
cd backend
python manage.py shell
```

```python
from apps.leads.models import Lead
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

Lead.objects.create(
    name="Sample Lead",
    email="sample@example.com",
    company="Sample Corp",
    status="new",
    source="website",
    owner=user
)
```

---

## 🧪 Testing

### **Backend Tests**
```bash
cd backend
python manage.py test apps.leads
```

### **API Testing with Thunder Client**

1. **Login** to get JWT token
2. **Create Lead** with token
3. **List Leads** to verify
4. **Update Lead** status
5. **Get Stats** to see metrics

### **Frontend Testing**

1. Open `http://localhost:5173/dashboard`
2. Click "+ Add Lead" button
3. Fill form and submit
4. Verify success toast appears
5. Check lead appears in list

---

## 🗓️ Development Roadmap

### **Phase 1: Foundation** ✅ (Week 1-2)
- [x] Django project setup
- [x] PostgreSQL integration
- [x] User authentication (JWT)
- [x] Lead model & CRUD operations
- [x] REST API endpoints
- [x] React dashboard UI
- [x] Lead form with validation
- [x] Success notifications

### **Phase 2: Notes & Analytics** 🚧 (Week 3-4)
- [ ] LeadActivity model (notes, calls, emails)
- [ ] Reminder system
- [ ] Dashboard analytics
- [ ] Charts & graphs (Recharts)
- [ ] Lead filtering & sorting
- [ ] Export to CSV

### **Phase 3: Polish & Deploy** 📦 (Week 5-6)
- [ ] Role-based access control
- [ ] Celery + Redis for async tasks
- [ ] Email notifications
- [ ] Docker containerization
- [ ] Cloud deployment (AWS/Heroku)
- [ ] CI/CD pipeline

### **Phase 4: Future Enhancements** 🔮
- [ ] Stripe integration
- [ ] Multi-tenant support
- [ ] Email/Calendar integration
- [ ] Mobile responsive improvements
- [ ] Advanced reporting
- [ ] Team collaboration features

---

## 📝 Environment Variables

### **Backend (.env)**
```env
DATABASE_NAME=micro_crm_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### **Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Django REST Framework team
- React & Vite communities
- Tailwind CSS
- Lucide Icons

---

## 📞 Support

For support, email your.email@example.com or open an issue on GitHub.

---

## 🎯 Project Status

**Current Version:** v0.1.0 (MVP)  
**Status:** 🟢 Active Development  
**Last Updated:** January 2026

---

**Built with ❤️ using Django & React**
