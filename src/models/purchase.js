"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");

const { Material, Firm } = sequelize.models;


const Purchase = sequelize.define(
  "Purchase",
  {

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

  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: async (purchase) => {

        const firm = await Firm.findByPk(purchase.FirmId);
        if (!firm) throw new Error('The firm is not found.')
        if (firm.status !== 2) throw new Error("The firm type shoul be supplier.");
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



module.exports = Purchase;


/* 
{
  "FirmId": 1,
  "MaterialId": 1,
  "quantity": 200,
  "unitPrice": 105
}
*/