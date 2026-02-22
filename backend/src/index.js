require('dotenv').config();
const express = require('express');
const cors    = require('cors');

// Load all models + associations from one place — MUST come before routes
const { sequelize } = require('./models/index');

const authRoutes      = require('./routes/auth');
const trackRoutes     = require('./routes/track');
const analyticsRoutes = require('./routes/analytics');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
// Mount at root so POST /register and POST /login match the spec directly.
// Also reachable at /auth/register and /auth/login.
app.use('/',          authRoutes);
app.use('/auth',      authRoutes);
app.use('/track',     trackRoutes);
app.use('/analytics', analyticsRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `${req.method} ${req.path} not found.` }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');
    await sequelize.sync({ alter: true });
    console.log('✅ Schema synced.');
    app.listen(PORT, () => {
      console.log(`🚀  http://localhost:${PORT}  [${sequelize.getDialect()}]`);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
}

start();
