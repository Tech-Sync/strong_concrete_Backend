"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const User = require("./user");

const Product = sequelize.define(
  "Product",
  {
    name: {
      type: DataTypes.STRING(32),
      allowNull: false,
      set(value) {
        this.setDataValue("name", value.toUpperCase());
      },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    materials: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  { paranoid: true }
);

// user - account
User.hasMany(Product, { foreignKey: "creatorId", as: "createdProducts" });
User.hasMany(Product, { foreignKey: "updaterId", as: "updatedProducts" });
Product.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Product.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

module.exports = Product;
