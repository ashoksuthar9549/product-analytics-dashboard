const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// NOTE: Do NOT import User here — associations are set up in index.js
// to avoid circular dependency issues with Node's module cache.
const FeatureClick = sequelize.define(
  'FeatureClick',
  {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id:      { type: DataTypes.INTEGER, allowNull: false },
    feature_name: { type: DataTypes.STRING,  allowNull: false },
    timestamp:    { type: DataTypes.DATE,    allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: 'feature_clicks',
    timestamps: false,
  }
);

module.exports = FeatureClick;