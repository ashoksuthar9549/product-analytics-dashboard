# Product Analytics Dashboard

> An interactive full-stack product analytics dashboard that visualizes its own usage — every filter change and chart interaction is tracked in real-time and fed back into the visualizations.

---

## 🔗 Links

| | URL |
|---|---|
| **GitHub Repository** | `https://github.com/ashoksuthar9549/product-analytics-dashboard` |
| **Live Demo** | `https://product-analytics-dashboard-liard.vercel.app/` |
| **Backend API** | `https://product-analytics-dashboard-73hb.onrender.com` |

---

## 📁 Repository Structure

```
product-analytics-dashboard/      ← root of this repo
├── README.md                     ← you are here (combined overview)
├── frontend/                     ← React + Vite SPA
│   ├── README.md                 ← detailed frontend docs
│   └── src/
│       ├── api/                  ← Axios client + API helpers
│       ├── components/           ← FilterBar, Charts, StatCard, etc.
│       ├── context/              ← AuthContext (global auth state)
│       ├── hooks/                ← useTrack, useCookieFilters
│       ├── pages/                ← Login, Dashboard
│       └── styles/               ← Global CSS design system
└── backend/                      ← Node.js + Express REST API
    ├── README.md                 ← detailed backend docs
    ├── seed.js                   ← database seeder script
    └── src/
        ├── config/               ← Sequelize database config
        ├── middleware/           ← JWT authentication
        ├── models/               ← User, FeatureClick (Sequelize)
        └── routes/               ← auth, track, analytics
```

> 📄 **Separate detailed READMEs** are available inside each subfolder:
> - [`frontend/README.md`](./frontend/README.md) — component architecture, hooks, deployment to Vercel/Netlify
> - [`backend/README.md`](./backend/README.md) — API reference, database schema, deployment to Render

---

## ✨ Features

- **JWT Authentication** — Register & login with hashed passwords; token auto-attached to all requests
- **Self-tracking Dashboard** — Every filter interaction fires `POST /track`, the data appears in the charts
- **Cookie-persisted Filters** — Date range, age group, and gender filters survive page refresh (30-day cookie)
- **Interactive Charts** — Horizontal bar chart (feature totals) + area/line chart (daily trend); clicking a bar updates the line chart
- **Data Seeding** — One command populates 10 users and 220+ click events across 60 days
- **Dual Database Support** — SQLite for local dev, PostgreSQL for production (zero code change)
- **Responsive UI** — Dark industrial design system; adapts from 4-column to single-column layout

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### 1 — Clone the repo

```bash
git clone 
cd product-analytics-dashboard
```

### 2 — Set up the Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment config and edit values
cp .env.example .env
# Minimum required: set JWT_SECRET to any long random string
# DB_DIALECT defaults to 'sqlite' — no extra setup needed for local dev

# Seed the database with demo users and click events
npm run seed

# Start the backend server (runs on port 5000)
npm run dev
```

You should see:
```
✅ Database connected.
✅ Schema synced.
🚀  http://localhost:5000  [sqlite]
```

### 3 — Set up the Frontend

Open a **new terminal tab**:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment config
cp .env.example .env
# VITE_API_URL=http://localhost:5000  ← already set correctly for local dev

# Start the dev server (runs on port 3000)
npm run dev
```

Open **http://localhost:3000** in your browser.

### 4 — Log in with demo credentials

After seeding, all demo accounts share the same password:

| Username | Age | Gender |
|---|---|---|
| `alice_pm` | 28 | Female |
| `bob_dev` | 34 | Male |
| `carol_ops` | 45 | Female |
| `dan_analyst` | 22 | Male |
| `eve_design` | 17 | Female |
| `frank_lead` | 52 | Male |
| `grace_qa` | 31 | Other |
| `hank_admin` | 60 | Male |
| `iris_ux` | 26 | Female |
| `jake_data` | 38 | Male |

**Password for all accounts:** `Password123!`

---

## 🌱 Seed Instructions

The seed script creates demo data so the dashboard is never empty on first load.

```bash
cd backend
npm run seed
```

**What it creates:**
- **10 demo users** with varied ages (17–60) and genders (Male, Female, Other)
- **220 feature click events** spread across the last 60 days
- Clicks are weighted realistically: `date_filter` and `bar_chart_click` appear most, `bar_chart_zoom` least

Re-running seed uses `findOrCreate` for users, so existing users won't be duplicated. Click records are always appended.

To start completely fresh with SQLite:

```bash
rm backend/database.sqlite
npm run seed    # from inside backend/
```

---

## 🏗️ Architecture & Design Choices

### Backend

| Concern | Choice | Reason |
|---|---|---|
| Runtime | Node.js + Express | Lightweight, non-blocking I/O, vast ecosystem |
| ORM | Sequelize 6 | Dialect-agnostic — same codebase for SQLite and PostgreSQL |
| Auth | JWT (stateless) | No server-side session storage needed; scales horizontally |
| Password hashing | bcryptjs (cost 10) | Industry standard; Sequelize `beforeCreate` hook ensures passwords are always hashed |
| DB (dev) | SQLite | Zero-config, file-based, perfect for local iteration |
| DB (prod) | PostgreSQL | ACID-compliant, handles concurrent writes, supported by all major PaaS platforms |

**Model structure:** `User.js` and `FeatureClick.js` each define only their own model. `models/index.js` is the single place that imports both, registers `hasMany`/`belongsTo` associations, and exports everything. This avoids circular dependency issues with Node's module cache.

**Auth middleware** decodes the JWT and attaches `{ id, username, age, gender }` to `req.user` without a DB lookup on every request — the payload is signed at login time and trusted on read.

**Analytics aggregation** is done entirely in SQL via Sequelize's `fn('COUNT')`, `fn('DATE_TRUNC')`, and `Op.between` — no in-memory processing. Filters (age group, gender, date range) are pushed down to the query level through dynamic `WHERE` clauses.

### Frontend

| Concern | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite 5 | Fast HMR, modern JSX transform, excellent DX |
| Charts | Recharts 2 | Composable, SVG-based, integrates naturally with React state |
| State | React Context + `useState` | No external store needed at this scale |
| Filter persistence | `js-cookie` in a custom hook | Survives hard refresh; cookies travel with requests (useful for future SSR) |
| Styling | CSS Modules + CSS variables | Zero runtime, scoped by default, easy theming |
| Tracking | Debounced fire-and-forget | `useTrack` hook debounces at 300 ms and swallows errors — tracking never blocks the UI |
| HTTP | Axios with interceptors | JWT auto-attach on every request; automatic redirect to `/login` on 401 |

**Cookie filter persistence** is handled by `useCookieFilters` — a custom hook that reads the cookie on mount (restoring last-used filters) and writes it on every change. The dashboard re-fetches analytics automatically whenever filters change, with a 400 ms debounce to avoid hammering the API on rapid input.

---

## 📡 API Reference

All protected endpoints require `Authorization: Bearer <token>` header.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Create account |
| `POST` | `/login` | ❌ | Get JWT token |
| `GET` | `/auth/me` | ✅ | Current user info |
| `POST` | `/track` | ✅ | Log a feature interaction |
| `GET` | `/analytics` | ✅ | Aggregated chart data |

**`GET /analytics` query parameters:**

| Param | Options | Default |
|---|---|---|
| `start_date` | ISO date string | 30 days ago |
| `end_date` | ISO date string | today |
| `age` | `<18` · `18-40` · `>40` · `all` | `all` |
| `gender` | `Male` · `Female` · `Other` · `all` | `all` |
| `feature` | any feature name | top feature by clicks |

---

## ☁️ Deployment

### Backend → Render

1. Push repo to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add a **PostgreSQL** database on Render → copy the connection string
7. Set environment variables:
   ```
   DB_DIALECT=postgres
   DB_HOST=...
   DB_PORT=5432
   DB_NAME=...
   DB_USER=...
   DB_PASSWORD=...
   JWT_SECRET=<a long random string>
   FRONTEND_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   ```
8. After first deploy, trigger the seed via: `node seed.js` in the Render shell

### Frontend → Vercel

1. Import the GitHub repo in [Vercel](https://vercel.com)
2. Root directory: `frontend`
3. Framework preset: **Vite**
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. Deploy — Vercel handles the build and CDN automatically

---

## ⚡ Scaling to 1 Million Write-Events per Minute

At 1M writes/minute (~16,700 writes/sec), a single Express + PostgreSQL setup becomes the bottleneck at the database layer long before the application layer. Here is how the architecture would evolve:

The first change would be to **decouple writes from the HTTP response**. Instead of writing directly to PostgreSQL on every `POST /track` call, the endpoint would publish the event to a **message queue** (Apache Kafka or AWS SQS) and return `202 Accepted` immediately — dropping API latency from ~20ms to ~2ms. A separate pool of **consumer workers** would then read from the queue in batches (e.g., 1,000 events every 100ms) and perform bulk inserts, dramatically reducing DB round-trips. The write-optimised storage layer would move to **TimescaleDB** (a PostgreSQL extension purpose-built for time-series append workloads) or **ClickHouse**, both of which are designed for millions of rows per second. On the read side, `GET /analytics` would query a **PostgreSQL read replica** rather than the primary, and frequently requested filter combinations would be cached in **Redis** (TTL ~60 seconds) to avoid re-running heavy `GROUP BY` aggregations on every request. The stateless Express workers would scale horizontally behind an **Application Load Balancer**, each connecting to Kafka independently with no shared in-process state. Finally, **CDN caching** (CloudFront or Vercel Edge) would absorb static asset traffic entirely, ensuring the compute layer handles only authenticated API calls.

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Recharts, Axios, js-cookie |
| Backend | Node.js, Express 4, Sequelize 6 |
| Database (dev) | SQLite 3 |
| Database (prod) | PostgreSQL 15 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Fonts | IBM Plex Mono, DM Sans, Bebas Neue |
| Hosting (frontend) | Vercel |
| Hosting (backend) | Render |

---

## 📝 License

MIT — free to use, modify, and distribute.
