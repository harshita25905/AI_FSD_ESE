# TalentAI: Employee Performance Analytics & Recommendation System

TalentAI is a state-of-the-art MERN (MongoDB, Express, React, Node.js) full-stack web application designed for HR professionals and administrators. It leverages external AI API (OpenRouter) integrations to generate high-fidelity, deep performance insights, promotional indicators, and personalized curriculum pathways for corporate talents.

---

## 🌟 Core Features

### 🔐 Authentication & Security
*   **JWT Token Authorization**: Restricts access to sensitive analytics data using secure `Bearer` JWT tokens.
*   **Password Hashing**: Implements robust password encryption using `bcryptjs`.
*   **Protected Workspace Routes**: Ensures unauthenticated users are seamlessly redirected to secure login screens.

### 📊 Database & Performance Benchmarks (MongoDB + Mongoose)
*   **Comprehensive Schema Design**: Tracks employee metadata, contact records, departments, skill arrays, performance score benchmarks, and tenure experience.
*   **Direct CRUD Lifecycle**: Full support for adding, editing, and permanently removing employee records from a centralized admin panel.
*   **Integrated Search & Filters**: Instant dynamic queries to filter personnel by department, performance scores, or direct keyword searches.

### 🧠 OpenRouter AI Intelligence Engine
*   **Promotion Recommendation**: Automatically calculates promotional readiness indicators using HSL performance score analytics.
*   **Dynamic Leaderboard Ranking**: Takes multiple checked employees and returns a full AI-ranked podium and detailed capability evaluations.
*   **Skill Enhancement & Training Paths**: Generates specific training curriculum customized to address registered skill shortages.
*   **Constructive AI Feedback**: Synthesizes structured growth feedback highlighting strengths and development goals.

---

## 📂 Architecture & Directory Structure

```text
AI_FSD_ESE/
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose Database Connector
│   ├── middleware/
│   │   └── authMiddleware.js     # Express JWT Validation Middleware
│   ├── models/
│   │   ├── User.js               # Admin / User Schema
│   │   └── Employee.js           # Employee Metrics Schema
│   ├── routes/
│   │   ├── auth.js               # /api/auth (Login & Registration)
│   │   ├── employee.js           # /api/employees (CRUD + Search)
│   │   └── ai.js                 # /api/ai (OpenRouter AI Integrations)
│   ├── .env                      # Environment Configuration
│   ├── package.json              # Backend Package Config
│   └── server.js                 # Main Application Entrypoint
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Glassmorphic Main Header
    │   │   └── ProtectedRoute.jsx# Auth Guard Router Wrap
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global State & Axios Base Interceptors
    │   ├── pages/
    │   │   ├── Login.jsx         # Access Portal Screen
    │   │   ├── Signup.jsx        # HR Sign up Page
    │   │   ├── EmployeeForm.jsx  # Employee Creation/Editing Modal
    │   │   ├── EmployeeList.jsx  # Primary Dashboard & Filters View
    │   │   └── AIRecommendation.jsx# Performance Insights Display Page
    │   ├── App.jsx               # Navigation Controller
    │   ├── index.css             # Tailwind v4 Configuration & Base Styles
    │   └── main.jsx              # React Bootstrapper
    ├── index.html                # App Wrapper
    ├── package.json              # Frontend Package Config
    └── vite.config.js            # Vite + Tailwind v4 Compiler Settings
```

---

## ⚡ Quick Start & Run Instructions

Ensure you have **Node.js** and **npm** installed on your Windows machine.

### 1️⃣ Set Up & Launch the Backend
Open a terminal in the root project folder:
```powershell
cd backend
# Verify variables are pre-loaded in .env:
# MONGO_URI, OPENROUTER_API_KEY, JWT_SECRET, PORT=5000

# Start server using nodemon for hot-reloading
npm run dev
# Or run direct: node server.js
```
*The server will boot and listen on [http://localhost:5000](http://localhost:5000) and establish connections with the MongoDB Atlas cluster.*

### 2️⃣ Set Up & Launch the Frontend
Open a separate terminal at the root project folder:
```powershell
cd frontend
# Start Vite Development Server
npm run dev
```
*Vite will compile files and open the dashboard locally, usually at [http://localhost:5173](http://localhost:5173).*

---

## 📡 REST API Specifications

### Authentication Routes
*   `POST /api/auth/signup`: Create a new HR administrator account.
*   `POST /api/auth/login`: Validate credentials and retrieve a 30-day secure JWT token.

### Employee Management Routes (Protected)
*   `POST /api/employees`: Add a new employee with valid metrics.
*   `GET /api/employees`: Fetch all active employee records.
*   `GET /api/employees/search?department=Development`: Filter employees by department.
*   `GET /api/employees/search?query=React`: Live keyword search across names, department, and skills.
*   `PUT /api/employees/:id`: Edit and update credentials or performance scores.
*   `DELETE /api/employees/:id`: Safely remove an employee profile.

### AI recommendation Routes (Protected)
*   `POST /api/ai/recommend`: Generate custom analysis.
    *   **Single Target Payload**: `{ "employeeId": "id_here" }`
    *   **Multi-podium Leaderboard Payload**: `{ "employeeIds": ["id1", "id2", "id3"] }`

---

## 🛡️ Security & Validations
*   **Duplicate Safeguards**: Enforces strict unique indices on email records to avoid duplicate personnel registration.
*   **Performance Range Caps**: Mongoose validation rejects scores below 0 or above 100.
*   **Header Integrity**: Middleware intercepts incoming API calls, parsing the authorization headers; non-existent or invalid signatures yield a direct `401 Unauthorized` response.
