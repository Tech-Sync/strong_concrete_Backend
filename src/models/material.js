"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");

const Material = sequelize.define(
  "Material",
  {
    name: {
      type: DataTypes.STRING(32),
      allowNull: false,
      set(value) {
        this.setDataValue("name", value.toUpperCase());
      },
    },
    unitType: {
      type: DataTypes.STRING(32),
      allowNull: false,
      set(value) {
        this.setDataValue(
          "unitType",
          value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
        );
      },
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { paranoid: true }
);



module.exports = Material;
