"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Firm = require("./firm");
const Material = require("./material");
const Account = require('./account');

const Purchase = sequelize.define(
  "Purchase",
  {
    MaterialId: {
      type: DataTypes.INTEGER,
      references: {
        model: Material,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.FLOAT,
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
      beforeCreate: (purchase) => {
        purchase.totalPrice = (purchase.unitPrice * purchase.quantity).toFixed(2);
      },
      beforeUpdate: async (purchase) => {
        const originalPurchase = await Purchase.findByPk(purchase.id, { raw: true });

        const quantityDiff = purchase.quantity - originalPurchase.quantity;
        const material = await Material.findByPk(originalPurchase.MaterialId);

        material.increment("quantity", { by: quantityDiff });

        purchase.totalPrice = (purchase.unitPrice * purchase.quantity).toFixed(2);
      },
      afterCreate: async (purchase) => {
        const material = await Material.findByPk(purchase.MaterialId);
        material.increment("quantity", { by: purchase.quantity });
      },
    },
  }
);


// material - purchase
Material.hasMany(Purchase);
Purchase.belongsTo(Material);

// firm - purchase
Firm.hasMany(Purchase);
Purchase.belongsTo(Firm);

module.exports = Purchase;