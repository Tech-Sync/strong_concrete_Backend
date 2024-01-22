"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Firm = require("./firm");
const Product = require("./product");
const User = require("./user");
const { saleStatuses } = require("../constraints/roles&status");

const Sale = sequelize.define(
  "Sale",
  {
    FirmId: {
      type: DataTypes.INTEGER,
      references: {
        model: Firm,
        key: "id",
      },
    },
    ProductId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.FLOAT,
    },
    location: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    otherCharges: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
    },
    discount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    requestedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sideContact: {
      type: DataTypes.STRING(13),
      allowNull: false,
    },
    confirmDate: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: Object.keys(saleStatuses)[0],
      validate: {
        isIn: {
          args: [Object.keys(saleStatuses)],
          msg: "Invalid status value",
        },
      },
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: async (sale) => {
        const firm = await Firm.findByPk(sale.FirmId);
        if (firm.status !== 1)
          throw new Error("The firm you have picked is not a Consumer !");

        if (!sale.unitPrice) {
          const product = await Product.findByPk(sale.ProductId);
          sale.unitPrice = product.price;
        }

        sale.totalPrice =
          sale.quantity * sale.unitPrice + sale.otherCharges - sale.discount;
      },
      beforeUpdate: (sale) => {
        sale.totalPrice =
          sale.quantity * sale.unitPrice + sale.otherCharges - sale.discount;
      },
    },
  }
);

// Firm - sale
Firm.hasMany(Sale);
Sale.belongsTo(Firm);

// Product - sale
Product.hasMany(Sale);
Sale.belongsTo(Product);

// user - sale
User.hasMany(Sale, { foreignKey: "creatorId", as: "createdSales" });
User.hasMany(Sale, { foreignKey: "updaterId", as: "updatedSales" });
Sale.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Sale.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

module.exports = Sale;

/* 
{
  "FirmId": 2,
  "ProductId": 1,
  "quantity": 5,
  "location": "Kabulonga",
  "requestedDate": "2024-01-15T08:15:11.218Z",
  "sideContact": "+26011111"
}
{
  "status": 2,
  "confirmDate": "2024-01-15T08:15:11.218Z"
}
*/
