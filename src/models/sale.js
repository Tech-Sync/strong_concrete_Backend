"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Firm = require("./firm");
const Product = require("./product");
const User = require("./user");

const statuses = {
  REJECTED: 3,
  APPROVED: 2,
  PENDING: 1,
};

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
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: (sale) => {
        // console.log(sale.status);

        sale.totalPrice = sale.quantity * sale.unitPrice + sale.otherCharges - sale.discount;

        if (!sale.status) sale.status = "PENDING";

        if (statuses[sale.status]) {
          sale.status = statuses[sale.status];
        } else {
          throw new Error("Invalid role");
        }
      },
      beforeUpdate: (sale) => {
        if (sale.changed("status")) {
          if (statuses[sale.status]) sale.status = statuses[sale.status];
          else throw new Error("Invalid role");
        }
        sale.totalPrice = sale.quantity * sale.unitPrice + sale.otherCharges - sale.discount;
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
