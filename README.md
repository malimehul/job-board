# Job Portal Platform

A full-stack Job Portal application built with **Node.js**, **Express.js**, **MongoDB**, **Next.js**, and **TypeScript**.

## Project Structure

```text
job-portal/
│
├── backend/          # Node.js + Express.js API
├── frontend/         # Next.js Frontend
├── package.json      # Root scripts
└── README.md
```

---

## Architecture Documentation

Detailed architecture decisions, design trade-offs, security considerations, and scalability notes are available in:

- [Overall Architecture Decisions](./ARCHITECTURE_DECISIONS.md)
- [Backend Architecture Decisions](./backend/ARCHITECTURE_DECISIONS.md)
- [Frontend Architecture Decisions](./frontend/ARCHITECTURE_DECISIONS.md)

---

# Prerequisites

Before running the project, make sure you have:

* Node.js (v23 or later recommended)
* npm (v10 or later)
* MongoDB (Local or MongoDB Atlas)

---

# Installation

Clone the repository:

```bash
git clone https://github.com/malimehul/job-board.git
cd job-portal
```

Install all dependencies:

```bash
npm run install:all
```

Alternatively, install manually:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ..
npm install
```

---

# Environment Variables

## Backend

Create a file:

```text
backend/.env
```

Example:

```env
PORT=5000
MONGO_URI=<your_mongo_uri>

JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=<your_jwt_expires_in>                  # 15m,  1h, 1d
JWT_REFRESH_SECRET=<your_jwt_refresh_secret>
JWT_REFRESH_EXPIRES_IN=<your_jwt_refresh_expires_in>  # 7d, 30d, 1y

# Cloudinary credentials (used to upload, store, and download candidate resume PDF files)
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# Email credentials (used to send emails)
SMTP_HOST=<smtp_host>        # e.g. smtp.gmail.com
SMTP_PORT=<smtp_port>        # 587 (TLS) or 465 (SSL)
SMTP_USER=<smtp_user>        # Email address
SMTP_PASS=<smtp_password>    # App password or SMTP password
```

---

## Frontend

Create:

```text
frontend/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NODE_ENV=development
```

---

# Running the Project

## Run Backend and Frontend Together

From the project root:

```bash
npm run dev
```

This starts:

* Backend
* Frontend

simultaneously.

---

## Run Backend Only

```bash
cd backend
npm run dev
```

---

## Run Frontend Only

```bash
cd frontend
npm run dev
```

---

# Default URLs

Frontend

```
http://localhost:3000
```

Backend

```
http://localhost:5000
```

---

# Available Root Scripts

| Command               | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `npm run install:all` | Install dependencies for root, backend, and frontend |
| `npm run dev`         | Run backend and frontend together                    |

---

# Technologies Used

## Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication
* Cloudinary
* Multer

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* TanStack Query
* React Hook Form
* Zod
* Zustand (state management instead of Redux)

---

# Notes

* Do **not** commit `.env` files.
* Use the provided `.env.example` files as references.
* Ensure MongoDB is running before starting the backend.

---
---


# Features Implemented By me

## Authentication & Authorization
- JWT-based Authentication
- Role-Based Access Control (Admin, Recruiter, Candidate)
- Secure Password Hashing (bcrypt)
- Protected Routes & Middleware
- Refresh Token Support (if implemented)

## Recruiter Features
- Register & Login
- Create Job Listings
- Edit Job Listings
- Delete Job Listings
- Close/Reopen Jobs
- View Applicants for Each Job
- Update Candidate Application Status (✅ Email Notifications to Candidate on Application Status Changes)
- Recruiter Dashboard
  - Active Jobs Count
  - Total Applicants
  - Recent Activity

## Candidate Features
- Register & Login
- Complete Candidate Profile
- Resume Upload
- Skills Management
- Years of Experience
- Browse Open Jobs
- Search Jobs
- Filter Jobs
- Apply with Cover Letter
- Track Application Status
- Save/Bookmark Jobs

## Admin Features
- Platform Dashboard
- Platform Statistics
- Filter Statistics by Date Range
- Charts & Analytics
- Manage Recruiters
- Manage Candidates
- Activate/Suspend Users
- View All Jobs
- View All Applications (Read Only)

## API Features
- RESTful API Design
- Standardized API Responses
- Global Error Handling
- Request Validation
- Pagination
- Sorting
- Filtering
- Search Functionality

## Database
- MongoDB
- Mongoose ODM
- Proper Schema Relationships
- Indexing
- Aggregation Pipelines

## Security
- JWT Authentication
- Password Hashing
- CORS Configuration
- Helmet Security Headers
- Rate Limiting
- Input Sanitization
- Environment Variable Management

## Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Responsive UI
- Error States
- Protected Pages
- Role-Based Navigation (RBAC)

## ✅ Additinal Implemented Features
- Forgot password with reset link send to user email address
- Reset password with reset token

## ✅ Bonus Features
- ✅ Zod Validation
- ✅ Email Notifications to Candidate on Application Status Changes
- ✅ API Documentation (Postman Collection: https://drive.google.com/file/d/1_m1ZiNmE7uwDmg1KRxhdTo2gruMoruqE/view?usp=drive_link)

## Developer Experience
- TypeScript
- ESLint
- Modular Folder Structure
- Reusable Components
- Custom Hooks
- Service Layer Architecture
- DTOs & Interfaces
- Environment Configuration
