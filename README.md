# TaskFlow — Scalable REST API with Auth & RBAC

A production-ready backend API built with **Node.js + Express + MongoDB**, featuring JWT authentication, role-based access control (RBAC), full CRUD, Swagger docs, and a React frontend. Built as part of the Backend Developer Intern assignment.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (Access + Refresh tokens) |
| Validation | express-validator |
| Docs | Swagger / OpenAPI 3.0 |
| Logging | Winston |
| Frontend | React 18 + React Router |
| Deployment | Docker + Docker Compose |

---

## Features

### Backend
- ✅ User registration & login with **bcrypt** password hashing
- ✅ **JWT access + refresh token** rotation strategy
- ✅ **Role-Based Access Control** — `user` and `admin` roles
- ✅ Full **CRUD** for Tasks (title, description, status, priority, due date, tags)
- ✅ **Pagination, filtering & text search** on tasks
- ✅ **API versioning** (`/api/v1/...`)
- ✅ Global error handling middleware
- ✅ Input sanitization (mongo-sanitize) & validation
- ✅ Rate limiting (global + strict on auth routes)
- ✅ Helmet security headers
- ✅ Winston structured logging
- ✅ Swagger UI at `/api-docs`

### Frontend
- ✅ Register / Login with form validation
- ✅ Protected dashboard with JWT (auto-refresh on expiry)
- ✅ Full CRUD task management UI
- ✅ Filter by status, paginated results
- ✅ Admin panel: user management, role changes, task stats
- ✅ Toast notifications for API responses

---

## Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, Swagger spec
│   │   ├── controllers/    # auth, task, user
│   │   ├── middleware/     # auth guard, RBAC, validation, error handler
│   │   ├── models/         # User, Task (Mongoose schemas)
│   │   ├── routes/v1/      # Versioned route files with JSDoc
│   │   └── utils/          # JWT helpers, logger, response helpers
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client with interceptors
│   │   ├── context/        # AuthContext (global auth state)
│   │   └── pages/          # Login, Register, Dashboard, Admin
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & install

```bash
git clone https://github.com/deva-ydv/taskflow_internshala_assignment.git
cd taskflow

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=another_long_random_string
JWT_REFRESH_EXPIRES_IN=30d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Run (development)

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend
npm start
```

- API: http://localhost:5000
- Frontend: http://localhost:3000
- Swagger Docs: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/health

---

## Docker Deployment

```bash
# Create .env in project root
echo "JWT_SECRET=your_secret_here" >> .env
echo "JWT_REFRESH_SECRET=your_refresh_secret" >> .env

# Build and run all services
docker-compose up --build
```

Services:
- Frontend → http://localhost:3000
- Backend → http://localhost:5000
- MongoDB → localhost:27017

---

## API Reference

Full interactive docs at `/api-docs` (Swagger UI).

### Auth Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Register new user |
| POST | `/api/v1/auth/login` | Public | Login, get tokens |
| POST | `/api/v1/auth/refresh` | Public | Refresh access token |
| POST | `/api/v1/auth/logout` | Private | Invalidate refresh token |
| GET | `/api/v1/auth/me` | Private | Get current user |

### Task Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/tasks` | Private | List tasks (paginated, filterable) |
| POST | `/api/v1/tasks` | Private | Create task |
| GET | `/api/v1/tasks/:id` | Private | Get single task |
| PATCH | `/api/v1/tasks/:id` | Private | Update task |
| DELETE | `/api/v1/tasks/:id` | Private | Delete task |
| GET | `/api/v1/tasks/stats` | Admin | Aggregate task stats |

### User Endpoints (Admin only)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/users` | Admin | List all users |
| GET | `/api/v1/users/:id` | Admin | Get user by ID |
| PATCH | `/api/v1/users/:id/role` | Admin | Update user role |
| PATCH | `/api/v1/users/:id/deactivate` | Admin | Deactivate user |
| PATCH | `/api/v1/users/me` | Private | Update own profile |

### Example Request

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"Password123"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Password123"}'

# Create task (use token from login)
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My first task","priority":"high","status":"todo"}'
```

---

## Security Practices

- **Password hashing**: bcrypt with salt rounds of 12
- **JWT rotation**: Refresh tokens are rotated on use and stored per-user (invalidation possible)
- **Rate limiting**: 100 req/15min globally, 10 req/15min on auth routes
- **Helmet**: Sets secure HTTP headers (XSS, clickjacking, MIME sniffing protection)
- **mongo-sanitize**: Strips `$` and `.` operators from request inputs to prevent NoSQL injection
- **Input validation**: All inputs validated and sanitized via express-validator
- **Role enforcement**: Middleware-level RBAC; ownership checks on all task mutations
- **Never expose passwords**: `select: false` on password field; stripped from all responses

---

## Database Schema

### User
```
_id, name, email (unique), password (hashed), role (user|admin),
refreshTokens [], isActive, lastLogin, createdAt, updatedAt
```

### Task
```
_id, title, description, status (todo|in-progress|completed),
priority (low|medium|high), dueDate, tags [], owner (ref: User),
createdAt, updatedAt

Indexes: { owner, status }, { owner, createdAt }, text index on title+description
```

---

## Scalability Note

### Current architecture
The API is stateless (JWT auth, no server-side sessions), making horizontal scaling straightforward — spin up multiple Node instances behind a load balancer (e.g., NGINX, AWS ALB) and they share MongoDB.

### Path to scale

**Caching (Redis)**
- Cache `GET /tasks` responses per user with a short TTL
- Store refresh tokens in Redis with TTL instead of MongoDB for faster lookups and automatic expiry

**Microservices**
- Auth service (login, token management)
- Task service (CRUD)
- Notification service (due date reminders via queues)
- Each independently deployable and scalable

**Message queues (Bull/RabbitMQ)**
- Decouple task creation from notifications/side effects
- Retry failed jobs without blocking the request lifecycle

**Database**
- MongoDB replica set for read scaling and failover
- Sharding by `owner` field for massive write throughput
- Read replicas for analytics/reporting queries

**Load balancing**
- NGINX reverse proxy across multiple app instances
- Sticky session not required (stateless JWT)
- Health check endpoint (`/health`) ready for load balancer probes

**Observability**
- Winston logs structured JSON — pipe to ELK Stack or Datadog
- Add Prometheus metrics middleware for request latency, error rates
- Distributed tracing with OpenTelemetry
