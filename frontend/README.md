# Analytics Dashboard — Frontend

React 18 + Vite SPA with Recharts, cookie-persisted filters, JWT auth, and real-time interaction tracking.

---

## Tech Stack

| Layer        | Choice                    |
|--------------|---------------------------|
| Framework    | React 18                  |
| Build tool   | Vite 5                    |
| Charts       | Recharts 2                |
| HTTP client  | Axios                     |
| Routing      | React Router v6           |
| Cookie mgmt  | js-cookie                 |
| Fonts        | IBM Plex Mono + DM Sans + Bebas Neue (Google Fonts) |

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Copy & configure env
cp .env.example .env
# Set VITE_API_URL to your backend URL (default: http://localhost:5000)

# 3. Start the dev server (proxies /api → backend)
npm run dev
```

App runs on **http://localhost:3000**.

> **Note:** Make sure the backend is running and seeded first (`npm run seed` in backend folder).

---

## Features

### Authentication
- Login & Register on a split-panel page
- JWT stored in `localStorage`, attached to all requests via Axios interceptor
- On 401, auto-redirects to `/login` and clears session

### Cookie-Persisted Filters
- `useCookieFilters` hook reads/writes filter state to a `analytics_filters` cookie (30-day expiry)
- On page refresh, the exact same filters (date range, age, gender) are restored automatically

### Dashboard
- **4 summary stat cards** — Total Clicks, Unique Users, Active Feature, Date Range
- **Horizontal Bar Chart** — Feature click totals, filterable by date/age/gender; clicking a bar highlights it and updates the line chart
- **Area/Line Chart** — Daily click trend for the selected feature, with gradient fill
- **Loading skeletons** — While data fetches, shimmer placeholders are shown
- **Responsive** — Adapts from 4-column grid → 2-column → single column

### Interaction Tracking
- Every filter change fires `POST /track` with the appropriate `feature_name`
- Bar chart clicks fire `POST /track` with `bar_chart_click`
- Calls are debounced (300 ms) and silently fail-safe — tracking never blocks the UI

---

## Deployment (Vercel / Netlify)

### Vercel
```bash
npm run build          # outputs to /dist
# Push to GitHub → import in Vercel dashboard
# Add env var VITE_API_URL=https://your-backend.onrender.com
```

### Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Add `_redirects` file with `/* /index.html 200` for SPA routing

---

## Project Structure

```
src/
├── api/
│   └── client.js           # Axios instance + API helpers
├── context/
│   └── AuthContext.jsx     # Global auth state (login/register/logout)
├── hooks/
│   ├── useTrack.js         # Debounced fire-and-forget tracking
│   └── useCookieFilters.js # Filter state ↔ cookie persistence
├── pages/
│   ├── Login.jsx / .module.css
│   └── Dashboard.jsx / .module.css
├── components/
│   ├── FilterBar.jsx       # Date + Age + Gender filter controls
│   ├── FeatureBarChart.jsx # Horizontal bar chart (Recharts)
│   ├── TrendLineChart.jsx  # Area/line chart (Recharts)
│   ├── StatCard.jsx        # Summary metric cards
│   └── ProtectedRoute.jsx  # Auth guard HOC
├── styles/
│   └── global.css          # Design system tokens + resets
├── App.jsx                 # Router
└── main.jsx                # Entry point
```
