# Authentication System

A full-stack authentication service built with React and Node.js — designed to understand how token-based auth actually works at the implementation level, not just the concept.

---
## Live demo
auth-system-delta-orpin.vercel.app

## What this is

Most tutorials show you *that* JWT works. This project was built to understand *why* — how tokens are signed, what refresh token rotation prevents, and how role-based access control can be structured cleanly without scattering permission checks across components.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, custom hooks |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Auth | JWT (access + refresh tokens), bcrypt |
| Access Control | Role-Based Access Control (RBAC) |

---

## Features

- **Secure registration & login** — passwords hashed with bcrypt before storage, never stored in plain text
- **JWT access + refresh token flow** — short-lived access tokens, refresh tokens rotated on use
- **Role-based access control** — different user types (e.g. admin, user) receive different permissions, enforced at the API level
- **RESTful API** — clean endpoints for signup, login, token refresh, and protected routes
- **React integration** — API calls abstracted into custom hooks, keeping UI components clean

---

## Project Structure

```
/client          # React frontend
  /hooks         # Custom hooks for auth state and API calls
  /components    # Login, Signup, Dashboard components

/server          # Node.js + Express backend
  /routes        # auth.js, user.js
  /middleware    # verifyToken.js, checkRole.js
  /models        # User schema (Mongoose)
  /controllers   # Auth logic
```

---

## How to Run

**Backend**
```bash
cd server
npm install
# create a .env file with MONGO_URI and JWT_SECRET
npm start
```

**Frontend**
```bash
cd client
npm install
npm start
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login, returns access + refresh token |
| POST | `/api/auth/refresh` | Issue new access token using refresh token |
| GET | `/api/user/profile` | Protected route — requires valid token |

---

## What I learned

- Why short-lived access tokens matter and what refresh token rotation actually prevents
- How bcrypt's cost factor affects both security and performance
- How to structure RBAC so permission logic lives in middleware, not scattered across routes
- The difference between stateless JWT auth and session-based auth, and when each makes sense

---

## Limitations & what's next

- Refresh tokens are currently not stored server-side — adding a token blacklist would allow proper logout
- No rate limiting on login endpoint yet (brute-force protection)
- Tests are minimal — adding Jest + Supertest for API route testing is the next step
