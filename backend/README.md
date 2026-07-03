# Job Portal Backend

REST API for the Job Portal platform built with **Node.js**, **Express.js**, **MongoDB**, and **TypeScript**.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- Cloudinary
- Multer
- Nodemailer

---

# Prerequisites

Before running the backend, make sure you have:

- Node.js (v23 or later recommended)
- npm (v10 or later)
- MongoDB (Local or MongoDB Atlas)  

---

# Installation

From the project root:

```bash
cd backend
npm install
```

---

# Environment Variables

Create a file:

```text
backend/.env
```

Example:

```env
PORT=5000

MONGO_URI=<your_mongo_uri>

# Browser client allowed by CORS
FRONTEND_URL=http://localhost:3000

JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=15m

JWT_REFRESH_SECRET=<your_refresh_secret>
JWT_REFRESH_EXPIRES_IN=7d

# Initial administrator credentials
# Required when starting with an empty users collection.
ADMIN_NAME=<admin_name>
ADMIN_EMAIL=<admin_email>
ADMIN_PASSWORD=<strong_admin_password>

# Cloudinary credentials
# Used to upload, store, and download candidate resume PDF files.
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# SMTP configuration
# Used for sending emails (OTP, password reset, notifications, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your_email>         # note: use your email address (e.g., [EMAIL_ADDRESS])
SMTP_PASS=<your_app_password>  # note: use your app password
```

---

# Running the Server

Development mode:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

---

# Default URL

```
http://localhost:5000
```

---

# Project Structure

```text
backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   └── server.ts
│
├── package.json
└── tsconfig.json
```

---

# Features

- JWT Authentication
- Refresh Token Authentication
- Role-Based Authorization
- Recruiter Job Management
- Candidate Job Applications
- Resume Upload (Cloudinary)
- Email Support
- Request Validation
- Global Error Handling
- MongoDB Integration

---

# Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build TypeScript project |
| `npm start` | Start production server |

---

# Notes

- Do **not** commit `.env` files.
- Use MongoDB Atlas or a local MongoDB instance.
- Cloudinary is required for resume PDF storage.
- Configure SMTP credentials to enable email functionality.
- On startup, an empty users collection is initialized with one Admin account
  using `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Existing users are
  never modified, and subsequent startups do not create another admin.
