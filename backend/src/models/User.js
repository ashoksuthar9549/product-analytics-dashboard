const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING,  allowNull: false, unique: true },
    password: { type: DataTypes.STRING,  allowNull: false },
    age:      { type: DataTypes.INTEGER, allowNull: false },
    gender:   { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: false },
  },
  {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

User.prototype.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = User;