"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");

const { productionStatuses } = require("../constraints/roles&status");

const Production = sequelize.define(
  "Production",
  {
    VehicleIds: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: Object.keys(productionStatuses)[0],
      validate: {
        isIn: {
          args: [Object.keys(productionStatuses)],
          msg: "Invalid status value",
        },
      },
    },
  },
  {
    paranoid: true,
  }
);


module.exports = Production;

/* 
{
  "status": 2,
  "VehicleIds": [
    1,
    2
  ]
}
*/
