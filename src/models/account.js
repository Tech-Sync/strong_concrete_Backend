"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Firm = require("./firm");
const Stock = require("./stock");

const Account = sequelize.define(
  "Account",
  {
    StockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Stock,
        key: "id",
      },
    },
    FirmId: {
      type: DataTypes.INTEGER,
      //   allowNull:false,
      references: {
        model: Firm,
        key: "id",
      },
    },
    debit: {
      type: DataTypes.FLOAT,
      //   allowNull: false,
    },
    credit: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.FLOAT,
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: async (account) => {
        const stock = await Stock.findByPk(account.StockId);
        account.FirmId = stock.FirmId;
        account.debit = stock.totalPrice;
        account.balance = (account.debit - account.credit).toFixed(2);
      },
      beforeUpdate: async (account) => {
        const stock = await Stock.findByPk(account.StockId);
        account.FirmId = stock.FirmId;
        account.debit = stock.totalPrice;
        account.balance = (account.debit - account.credit).toFixed(2);
      },
    },
  }
);

// Firm  - account
Firm.hasMany(Account);
Account.belongsTo(Firm);

// stock - account
Stock.hasOne(Account);
Account.belongsTo(Stock);

module.exports = Account;
