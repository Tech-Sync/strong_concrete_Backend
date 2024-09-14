"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Firm = require("./firm");
const Purchase = require("./purchase");
const User = require("./user");

const PurchaseAccount = sequelize.define(
  "PurchaseAccount",
  {
    PurchaseId: {
      type: DataTypes.INTEGER,
      references: {
        model: Purchase,
        key: "id",
      },
    },
    debit: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    credit: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    FirmId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Firm,
        key: "id",
      },
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: async (purchaseAccount) => {
        if(purchaseAccount.PurchaseId){
          const purchase = await Purchase.findByPk(purchaseAccount.PurchaseId);
          purchaseAccount.FirmId = purchase?.FirmId;
          purchaseAccount.debit = purchase?.totalPrice;
          purchaseAccount.balance = (purchaseAccount.debit - purchaseAccount.credit).toFixed(2);
        }
  
      },
      beforeUpdate: async (purchaseAccount) => {
        const purchase = await Purchase.findByPk(purchaseAccount.PurchaseId);
        purchaseAccount.FirmId = purchase.FirmId;
        purchaseAccount.debit = purchase.totalPrice;
        purchaseAccount.balance = (purchaseAccount.debit - purchaseAccount.credit).toFixed(2);
      },
    },
  }
);

// user - purchaseAccount
User.hasMany(PurchaseAccount, { foreignKey: "creatorId", as: "createdAccounts" });
User.hasMany(PurchaseAccount, { foreignKey: "updaterId", as: "updatedAccounts" });
PurchaseAccount.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
PurchaseAccount.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

// Purchase  - PurchaseAccount
// Purchase.hasOne(PurchaseAccount, { foreignKey: 'PurchaseId' });
// PurchaseAccount.belongsTo(Purchase, { foreignKey: 'PurchaseId' });

// Firm - PurchaseAccount
Firm.hasMany(PurchaseAccount, { foreignKey: 'FirmId' });
PurchaseAccount.belongsTo(Firm, { foreignKey: 'FirmId' });

module.exports = PurchaseAccount;
