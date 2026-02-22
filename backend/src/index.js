// // require('dotenv').config();
// // const express = require('express');
// // const cors = require('cors');
// // const sequelize = require('./config/database');

// // // Import models to ensure associations are registered
// // require('./models/User');
// // require('./models/FeatureClick');

// // // Import routes
// // const authRoutes = require('./routes/auth');
// // const trackRoutes = require('./routes/track');
// // const analyticsRoutes = require('./routes/analytics');

// // const app = express();
// // const PORT = process.env.PORT || 5000;

// // // ─── Middleware ────────────────────────────────────────────────────────────────
// // app.use(
// //   cors({
// //     origin: process.env.FRONTEND_URL || '*',
// //     credentials: true,
// //   })
// // );

// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // // ─── Routes ───────────────────────────────────────────────────────────────────
// // app.use('/auth', authRoutes);      // POST /auth/register  POST /auth/login  GET /auth/me
// // app.use('/track', trackRoutes);    // POST /track
// // app.use('/analytics', analyticsRoutes); // GET /analytics

// // // Convenience aliases matching spec exactly
// // app.post('/register', (req, res, next) => {
// //   req.url = '/register';
// //   authRoutes(req, res, next);
// // });
// // app.post('/login', (req, res, next) => {
// //   req.url = '/login';
// //   authRoutes(req, res, next);
// // });

// // // ─── Health check ─────────────────────────────────────────────────────────────
// // app.get('/health', (req, res) => {
// //   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// // });

// // // ─── 404 handler ──────────────────────────────────────────────────────────────
// // app.use((req, res) => {
// //   res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
// // });

// // // ─── Global error handler ─────────────────────────────────────────────────────
// // app.use((err, req, res, next) => {
// //   console.error('Unhandled error:', err);
// //   res.status(500).json({ error: 'Internal server error.' });
// // });

// // // ─── Database sync & server start ─────────────────────────────────────────────
// // async function start() {
// //   try {
// //     await sequelize.authenticate();
// //     console.log('✅ Database connection established.');

// //     // sync({ alter: true }) safely updates schema without dropping data
// //     await sequelize.sync({ alter: true });
// //     console.log('✅ Database synchronized.');

// //     app.listen(PORT, () => {
// //       console.log(`🚀 Server running on http://localhost:${PORT}`);
// //       console.log(`   Dialect: ${sequelize.getDialect()}`);
// //       console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
// //     });
// //   } catch (err) {
// //     console.error('❌ Failed to start server:', err);
// //     process.exit(1);
// //   }
// // }

// // start();
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const sequelize = require('./config/database');

// // Import models to ensure associations are registered
// require('./models/User');
// require('./models/FeatureClick');

// // Import routes
// const authRoutes = require('./routes/auth');
// const trackRoutes = require('./routes/track');
// const analyticsRoutes = require('./routes/analytics');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ─── Middleware ────────────────────────────────────────────────────────────────
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || '*',
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ─── Routes ───────────────────────────────────────────────────────────────────
// // Mount auth at root so spec-required /register and /login work directly.
// // Also available at /auth/register and /auth/login for frontend convenience.
// app.use('/', authRoutes);          // POST /register  POST /login  GET /me
// app.use('/auth', authRoutes);      // POST /auth/register  POST /auth/login  GET /auth/me
// app.use('/track', trackRoutes);    // POST /track
// app.use('/analytics', analyticsRoutes); // GET /analytics

// // ─── Health check ─────────────────────────────────────────────────────────────
// app.get('/health', (req, res) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// // ─── 404 handler ──────────────────────────────────────────────────────────────
// app.use((req, res) => {
//   res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
// });

// // ─── Global error handler ─────────────────────────────────────────────────────
// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ error: 'Internal server error.' });
// });

// // ─── Database sync & server start ─────────────────────────────────────────────
// async function start() {
//   try {
//     await sequelize.authenticate();
//     console.log('✅ Database connection established.');

//     // sync({ alter: true }) safely updates schema without dropping data
//     await sequelize.sync({ alter: true });
//     console.log('✅ Database synchronized.');

//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on http://localhost:${PORT}`);
//       console.log(`   Dialect: ${sequelize.getDialect()}`);
//       console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
//     });
//   } catch (err) {
//     console.error('❌ Failed to start server:', err);
//     process.exit(1);
//   }
// }

// start();

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