"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Firm = require("./firm");
const Sale = require("./sale");
const User = require("./user");

const SaleAccount = sequelize.define(
  "SaleAccount",
  {
    SaleId: {
      type: DataTypes.INTEGER,
      references: {
        model: Sale,
        key: "id",
      },
    },
    FirmId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Firm,
        key: "id",
      },
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    paid: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: async (saleAccount) => {
        if (saleAccount.SaleId) {
          const sale = await Sale.findByPk(saleAccount.SaleId);
          saleAccount.FirmId = sale?.FirmId;
          saleAccount.totalPrice = sale?.totalPrice;
          saleAccount.balance = (saleAccount.totalPrice - saleAccount.paid).toFixed(2);
        }
      },
      beforeUpdate: async (saleAccount) => {
        const sale = await Sale.findByPk(saleAccount.SaleId);
        saleAccount.FirmId = sale.FirmId;
        saleAccount.debit = sale.totalPrice;
        saleAccount.balance = (saleAccount.totalPrice - saleAccount.paid).toFixed(2);
      },
    },
  }
);

// user - account
User.hasMany(SaleAccount, {foreignKey: "creatorId",as: "createdSaleAccounts",});
User.hasMany(SaleAccount, {foreignKey: "updaterId",as: "updatedSaleAccounts",});
SaleAccount.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
SaleAccount.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

// Sale  - SaleAccount
Sale.hasOne(SaleAccount);
SaleAccount.belongsTo(Sale);

// Firm - SaleAccount
Firm.hasMany(SaleAccount);
SaleAccount.belongsTo(Firm);

module.exports = SaleAccount;
