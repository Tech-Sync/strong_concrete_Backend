"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Firm = require("./firm");
const Purchase = require("./purchase");

const Account = sequelize.define(
  "Account",
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
      beforeCreate: async (account) => {
        console.log('before calisti');
        if(account.PurchaseId){
          const purchase = await Purchase.findByPk(account.PurchaseId);
          account.FirmId = purchase?.FirmId;
          account.debit = purchase?.totalPrice;
          account.balance = (account.debit - account.credit).toFixed(2);
        }
  
      },
      beforeUpdate: async (account) => {
        const purchase = await Purchase.findByPk(account.PurchaseId);
        account.FirmId = purchase.FirmId;
        account.debit = purchase.totalPrice;
        account.balance = (account.debit - account.credit).toFixed(2);
      },
    },
  }
);

// Purchase  - Account
Purchase.hasOne(Account);
Account.belongsTo(Purchase);

// Firm - Account
Firm.hasMany(Account);
Account.belongsTo(Firm);

module.exports = Account;
