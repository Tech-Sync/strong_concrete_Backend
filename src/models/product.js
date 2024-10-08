"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");

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



module.exports = Product;

/* 
{
  "name": "c35",
  "price": 100,
  "materials": {
    "STONE": 1.9,
    "SAND": 1.9,
    "CEMENT": 270
  }
}
*/