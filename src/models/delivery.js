"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Production = require("./production");
const User = require("./user");
const Vehicle = require("./vehicle");
const { deliveryStatuses } = require("../constraints/roles&status");

const Delivery = sequelize.define(
  "Delivery",
  {
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: Object.keys(deliveryStatuses)[0],
      validate: {
        isIn: {
          args: [Object.keys(deliveryStatuses)],
          msg: "Invalid status value",
        },
      },
    },
  },
  {
    paranoid: true,
  }
);

// Vehicle.hasMany(Delivery);
// Delivery.belongsTo(Vehicle);

// user - delivery
User.hasMany(Delivery, { foreignKey: "creatorId", as: "createdDeliverys" });
User.hasMany(Delivery, { foreignKey: "updaterId", as: "updatedDeliverys" });
Delivery.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Delivery.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

module.exports = Delivery;
