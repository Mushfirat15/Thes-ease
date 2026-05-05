# Thes-ease — Thesis Slot Booking System

A web-based platform for BRAC University that automates thesis consultation scheduling between students and supervisors.

## Tech Stack

- **Frontend**: React.js (Vite), React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT, bcrypt, OTP email verification

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend
```bash
cd backend
npm install
# Edit .env with your MongoDB URI and email settings
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend API on `http://localhost:5000`.

## Features (v1)
- [x] User registration with university email validation
- [x] Email verification via 6-digit OTP
- [x] JWT-based authentication
- [x] Role auto-detection (student/supervisor)
- [x] Password encryption (bcrypt)
- [x] Protected routes
