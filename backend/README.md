# Analytics Dashboard — Backend

Express.js REST API with JWT authentication, Sequelize ORM (PostgreSQL / SQLite), and analytics aggregation.

---

## Tech Stack

| Layer       | Choice                     |
|-------------|----------------------------|
| Runtime     | Node.js 18+                |
| Framework   | Express.js 4               |
| ORM         | Sequelize 6                |
| DB (dev)    | SQLite 3                   |
| DB (prod)   | PostgreSQL 15              |
| Auth        | JWT (jsonwebtoken)         |
| Hashing     | bcryptjs                   |

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and edit values
cp .env.example .env

# 3. Seed the database (creates 10 users + 220 click events)
npm run seed

# 4. Start the dev server
npm run dev
```

Server starts on **http://localhost:5000**.

---

## API Reference

### Authentication

| Method | Path              | Auth | Description              |
|--------|-------------------|------|--------------------------|
| POST   | `/auth/register`  | ❌   | Create account           |
| POST   | `/auth/login`     | ❌   | Get JWT token            |
| GET    | `/auth/me`        | ✅   | Get current user info    |

**Register / Login body:**
```json
{ "username": "alice", "password": "Secret123", "age": 28, "gender": "Female" }
```

**Response includes:**
```json
{ "token": "<jwt>", "user": { "id": 1, "username": "alice", "age": 28, "gender": "Female" } }
```

---

### Tracking

| Method | Path      | Auth | Description              |
|--------|-----------|------|--------------------------|
| POST   | `/track`  | ✅   | Log a feature interaction |

**Body:**
```json
{ "feature_name": "date_filter" }
```

---

### Analytics

| Method | Path          | Auth | Description                    |
|--------|---------------|------|--------------------------------|
| GET    | `/analytics`  | ✅   | Get chart data with filters    |

**Query parameters:**

| Param        | Type   | Default     | Example                  |
|--------------|--------|-------------|--------------------------|
| `start_date` | ISO    | 30 days ago | `2024-01-01`             |
| `end_date`   | ISO    | now         | `2024-12-31`             |
| `age`        | string | `all`       | `<18` / `18-40` / `>40` |
| `gender`     | string | `all`       | `Male` / `Female` / `Other` |
| `feature`    | string | top feature | `date_filter`            |

**Response:**
```json
{
  "bar_chart": [
    { "feature_name": "date_filter", "total_clicks": 72 }
  ],
  "line_chart": [
    { "date": "2024-06-01", "click_count": 8 }
  ],
  "summary": {
    "total_clicks": 215,
    "unique_users": 9,
    "date_range": { "start": "...", "end": "..." },
    "active_feature": "date_filter"
  }
}
```

---

## Seed Instructions

```bash
npm run seed
```

Creates **10 demo users** and **220 feature click events** spread across the last 60 days.

All demo users share the password: **`Password123!`**

Sample usernames: `alice_pm`, `bob_dev`, `carol_ops`, `dan_analyst`, `eve_design` …

---

## Deployment (Render)

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repo.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add a **PostgreSQL** database in Render and copy the connection details.
6. Add environment variables (from `.env.example`) in the Render dashboard.
7. Set `DB_DIALECT=postgres` and fill in Render's Postgres credentials.

---

## Architecture Note — 1 Million Writes/Minute

At 1M writes/minute (~16,667/sec), a single Postgres instance becomes a bottleneck. Here's how the architecture would evolve:

1. **Message Queue (Kafka / SQS):** The `/track` endpoint becomes fire-and-forget — it publishes to a Kafka topic and returns immediately. No DB write in the hot path.
2. **Consumer Workers:** A pool of workers consumes from Kafka and performs **bulk inserts** (e.g. 500 rows every 200 ms) instead of one insert per request. This dramatically reduces DB round-trips.
3. **Write-optimised store:** Use **TimescaleDB** (Postgres extension for time-series) or **ClickHouse** for the clicks table — both are built for high-throughput append workloads.
4. **Read replica + Caching:** Analytics (`GET /analytics`) reads from a Postgres **read replica**. Frequently requested filter combinations are cached in **Redis** (TTL ~60 s) to avoid repeated heavy aggregation queries.
5. **Horizontal scaling:** Stateless Express workers scale behind a load balancer (e.g. AWS ALB). Each worker connects to Kafka; no shared in-process state.
6. **CDN / Edge:** Static frontend assets are served via CDN; API is placed behind CloudFront or a regional edge for latency reduction.
