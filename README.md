# VoteNG - Digital Voting Platform

VoteNG is a full-stack digital voting application built for secure, transparent, and user-friendly election management. The project includes a React frontend, an Express API, and MongoDB data storage, with voter verification, election management, vote casting, live results, and audit logging.

## Overview

This project is designed to support a simple election workflow for registered voters and administrators:

- Voters register and verify their accounts with an OTP code
- Only verified users can vote
- Elections are created and managed by an admin
- Each voter can vote once per election
- Results update as votes are submitted
- Election data is protected with a hash-based blockchain-style verification layer

## Features

### Voter features
- User registration with validation for NIN and voter card number
- Email-based OT P verification for account activation
- Secure login with JWT authentication
- Election list with status labels such as upcoming, active, and closed
- Candidate selection by position
- One-vote-per-election enforcement
- Results view for each election
- Vote status check for each voter

### Admin features
- Secure admin-only dashboard
- Election creation, activation, and closure
- Candidate management for each election
- Voter overview with verification status
- Audit log tracking for important actions
- Dashboard statistics for total voters, elections, active elections, and votes cast

### Security and integrity
- Password hashing with bcrypt
- JWT-based protected routes
- Verified account requirement before voting
- Rate limiting on authentication and voting actions
- Hash-chain integrity checks for vote records
- Audit trails for registrations, logins, votes, and election changes

## Technology Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Recharts
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Helmet and CORS for security
- Express rate limiting
- Socket.IO (server-side real-time support)

### Additional services and utilities
- Nodemailer / Brevo email delivery for OTP messages
- bcrypt for password hashing
- crypto-based hash verification for vote integrity

## Project Structure

```text
voting-system/
├── client/                 # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── package.json
│   └── server.js
├── .git/
└── README.md
```

## Screenshots

This project does not currently include screenshots in the repository. To add them later, create a folder such as `docs/screenshots/` or `assets/screenshots/` and save images there.

Example:

```text
docs/
└── screenshots/
    ├── home-page.png
    ├── election-list.png
    ├── vote-page.png
    └── admin-dashboard.png
```

Then 

## Prerequisites

Before running the project locally, make sure you have:

- Node.js installed
- npm installed
- MongoDB running locally or a MongoDB Atlas connection string
- A browser for the frontend

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd voting-system
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

## Environment Variables

Create a `.env` file in the `server` folder with the variables below. Use placeholder values only.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=1h
CLIENT_URL=http://localhost:5173
NODE_ENV=development
BREVO_API_KEY=your_brevo_api_key
EMAIL_USER=your_verified_email_address
```

Notes:
- `MONGO_URI` is required for database connectivity.
- `JWT_SECRET` should be a long random secret string.
- `BREVO_API_KEY` and `EMAIL_USER` are used for production email delivery. In development mode, the OTP code is printed in the terminal instead of being emailed.
- The frontend uses `VITE_API_URL` if present; otherwise it defaults to `http://localhost:5000/api`.

## Running the Project Locally

### Start the backend

```bash
cd server
npm run dev
```

The backend API will run on:

```text
http://localhost:5000
```

### Start the frontend

Open a separate terminal and run:

```bash
cd client
npm run dev
```

The frontend development server usually runs on:

```text
http://localhost:5173
```

## Default Demo Accounts

This project includes seed data for quick testing. The seed script is defined in the backend and can be run with:

```bash
cd server
npm run seed
```

The generated sample accounts are defined in the code and include:

- Admin email: `admin@voteng.gov.ng`
- Admin password: `Admin1234`
- Voter email: `emeka@email.com`
- Voter password: `Voter1234`

> These are example values from the repository and should be changed or removed in production.

## Live Demo

- Frontend: https://voteng-beta.vercel.app
- Backend API: https://voteng-server.onrender.com/

## Notes

- The project is a student or prototype voting system and should be reviewed carefully before production deployment.
- For production use, add stronger validation, secure hosting, and deployment hardening.
- The backend currently supports OTP-based verification and an audit log approach suitable for a demo or internal project.
