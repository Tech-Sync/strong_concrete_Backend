"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const { Sale } = sequelize.models;


const SaleAccount = sequelize.define(
  "SaleAccount",
  {
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



module.exports = SaleAccount;
