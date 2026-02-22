const sequelize = require('../config/database');
const User = require('./User');
const FeatureClick = require('./FeatureClick');

// ── Associations ──────────────────────────────────────────────────────────────
// Defined here (not in individual files) to avoid circular require issues.
User.hasMany(FeatureClick, { foreignKey: 'user_id', as: 'clicks' });
FeatureClick.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, User, FeatureClick };