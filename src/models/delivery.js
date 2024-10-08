"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
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

module.exports = Delivery;
