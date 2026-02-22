/**
 * Seed Script — npm run seed
 *
 * Populates the database with:
 *  - 10 demo users (varied age & gender)
 *  - 200+ feature click records spread across the last 60 days
 */

require('dotenv').config();
const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const FeatureClick = require('./src/models/FeatureClick');

// ─── Seed Data ────────────────────────────────────────────────────────────────
const DEMO_USERS = [
  { username: 'alice_pm',    password: 'Password123!', age: 28, gender: 'Female' },
  { username: 'bob_dev',     password: 'Password123!', age: 34, gender: 'Male'   },
  { username: 'carol_ops',   password: 'Password123!', age: 45, gender: 'Female' },
  { username: 'dan_analyst', password: 'Password123!', age: 22, gender: 'Male'   },
  { username: 'eve_design',  password: 'Password123!', age: 17, gender: 'Female' },
  { username: 'frank_lead',  password: 'Password123!', age: 52, gender: 'Male'   },
  { username: 'grace_qa',    password: 'Password123!', age: 31, gender: 'Other'  },
  { username: 'hank_admin',  password: 'Password123!', age: 60, gender: 'Male'   },
  { username: 'iris_ux',     password: 'Password123!', age: 26, gender: 'Female' },
  { username: 'jake_data',   password: 'Password123!', age: 38, gender: 'Male'   },
];

const FEATURE_NAMES = [
  'date_filter',
  'age_filter',
  'gender_filter',
  'bar_chart_click',
  'bar_chart_zoom',
  'line_chart_hover',
];

// Weighted so some features appear more than others (realistic distribution)
const FEATURE_WEIGHTS = [30, 20, 15, 25, 5, 5];

function weightedRandom(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomDate(daysAgo) {
  const now = Date.now();
  const past = now - daysAgo * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');
    await sequelize.sync({ alter: true });
    console.log('✅ Schema synchronized.');

    // ── 1. Create users ──────────────────────────────────────────────────────
    const createdUsers = [];
    for (const userData of DEMO_USERS) {
      const [user, created] = await User.findOrCreate({
        where: { username: userData.username },
        defaults: userData,
      });
      createdUsers.push(user);
      console.log(`  ${created ? '➕' : '⏭️ '} User: ${user.username}`);
    }

    // ── 2. Generate click records ────────────────────────────────────────────
    const clicks = [];
    const CLICKS_PER_USER = 22; // 10 users × 22 = 220 total clicks

    for (const user of createdUsers) {
      for (let i = 0; i < CLICKS_PER_USER; i++) {
        clicks.push({
          user_id: user.id,
          feature_name: weightedRandom(FEATURE_NAMES, FEATURE_WEIGHTS),
          timestamp: randomDate(60), // spread over last 60 days
        });
      }
    }

    // Shuffle for varied ordering
    clicks.sort(() => Math.random() - 0.5);

    await FeatureClick.bulkCreate(clicks);
    console.log(`\n✅ Seeded ${clicks.length} feature click records across ${createdUsers.length} users.`);

    // ── 3. Print summary ─────────────────────────────────────────────────────
    const featureGroups = clicks.reduce((acc, c) => {
      acc[c.feature_name] = (acc[c.feature_name] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Clicks per feature:');
    Object.entries(featureGroups)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        const bar = '█'.repeat(Math.round(count / 3));
        console.log(`   ${name.padEnd(20)} ${bar} (${count})`);
      });

    console.log('\n🔑 Demo credentials (all share the same password):');
    console.log('   Password: Password123!');
    DEMO_USERS.forEach((u) => console.log(`   Username: ${u.username}  (age ${u.age}, ${u.gender})`));

  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n✅ Done — database connection closed.');
  }
}

seed();
