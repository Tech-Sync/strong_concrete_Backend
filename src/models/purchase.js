"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const PurchaseAccount = require("./purchaseAccount");
const Firm = require("./firm");
const Material = require("./material");
const User = require("./user");

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
      beforeCreate: async(purchase) => {
        const firm = await Firm.findByPk(purchase.FirmId);
        if(!firm) throw new Error('The firm is not found.')
        if (firm.status !== 2)throw new Error("The firm type shoul be supplier.");
        purchase.totalPrice = (purchase.unitPrice * purchase.quantity).toFixed(2);
      },
      beforeUpdate: async (purchase) => {
        const originalPurchase = await Purchase.findByPk(purchase.id);
        const quantityDiff = (purchase.quantity - originalPurchase.quantity).toFixed(2);
        const material = await Material.findByPk(originalPurchase.MaterialId);
        if (material) material.increment("quantity", { by: quantityDiff });
        purchase.totalPrice = (purchase.unitPrice * purchase.quantity).toFixed(2);
      },
      afterCreate: async (purchase) => {
        const material = await Material.findByPk(purchase.MaterialId);
        material.increment("quantity", { by: purchase.quantity });
      },
      beforeDestroy: async (purchase) => {
        const deletedPurchase = await Purchase.findByPk(purchase.id);
        const material = await Material.findByPk(deletedPurchase.MaterialId);
        if (material) material.decrement("quantity", { by: deletedPurchase.quantity });
      },
    },
  }
);

// user - Purchase
User.hasMany(Purchase, { foreignKey: "creatorId", as: "createdPurchases" });
User.hasMany(Purchase, { foreignKey: "updaterId", as: "updatedPurchases" });
Purchase.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Purchase.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

// material - purchase
Material.hasMany(Purchase);
Purchase.belongsTo(Material);

// firm - purchase
Firm.hasMany(Purchase);
Purchase.belongsTo(Firm);

module.exports = Purchase;


/* 
{
  "FirmId": 1,
  "MaterialId": 1,
  "quantity": 200,
  "unitPrice": 105
}
*/