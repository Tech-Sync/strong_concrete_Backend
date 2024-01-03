"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Firm = require("./firm");

const Stock = sequelize.define(
  "Stock",
  {
    name: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unitType: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
    },
    FirmId: {
      type: DataTypes.INTEGER,
      references: {
        model: Firm,
        key: "id",
      },
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: (stock) => {
        stock.totalPrice = (stock.unitPrice * stock.quantity).toFixed(2);
      },
      beforeUpdate: (stock) => {
        stock.totalPrice = (stock.unitPrice * stock.quantity).toFixed(2);
      },
    },
  }
);

// firm = stock
Firm.hasMany(Stock);
Stock.belongsTo(Firm);

module.exports = Stock;
