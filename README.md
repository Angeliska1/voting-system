# VoteNG

VoteNG is a digital voting platform for secure elections, voter verification, and transparent result tracking. It uses a React frontend, Express backend, and MongoDB database.

## Live Demo

- Frontend: https://voteng-beta.vercel.app
- Backend API: https://voteng-server.onrender.com/

## Features

### Voter Features
- NIN and voter card validation during registration
- Email OTP verification
- Secure JWT-based login
- Election listing and status tracking
- Candidate selection by position
- One-vote-per-election enforcement
- Results viewing after voting
- Vote status tracking

### Admin Features
- Admin-only dashboard
- Election creation and management
- Candidate management
- Voter verification overview
- Audit log tracking
- Summary statistics for voters, elections, and votes

### Security
- bcrypt password hashing
- JWT-protected routes
- Verified voter requirement before voting
- Rate limiting for authentication and voting actions
- Hash-chain validation for vote integrity

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT
- Helmet
- CORS
- Express Rate Limit

### Additional Tools
- Nodemailer / Brevo for OTP email delivery
- bcrypt for hashing
- crypto-based vote verification

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
├── README.md
└── .git/
```

## Prerequisites

- Node.js
- npm
- MongoDB running locally or a MongoDB Atlas connection string
- Browser

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

Create a `.env` file in the `server` folder:

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

### Notes
- `MONGO_URI` is required for database connectivity.
- `JWT_SECRET` should be a strong random value.
- `BREVO_API_KEY` and `EMAIL_USER` are used for production email delivery.
- In development, OTP codes are printed in the terminal instead of email.
- The frontend uses `VITE_API_URL` when set; otherwise it defaults to `http://localhost:5000/api`.

## Run Locally

### Start the backend

```bash
cd server
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

### Start the frontend

```bash
cd client
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Demo Accounts

```bash
cd server
npm run seed
```

### Default accounts
- Admin email: `admin@voteng.gov.ng`
- Admin password: `Admin1234`
- Voter email: `emeka@email.com`
- Voter password: `Voter1234`

> These are example values and should be changed in production.

## Notes

- This is a student/demo voting system and should be reviewed before production deployment.
- For production use, add stronger validation, secure hosting, and deployment hardening.
- The backend supports OTP verification and audit logging for demonstration and internal use.
