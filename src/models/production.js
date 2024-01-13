"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Sale = require("./sale");
const User = require("./user");
const Delivery = require("./delivery");

const { productionStatuses } = require("../constraints/roles&status");

const Production = sequelize.define(
  "Production",
  {
    SaleId: {
      type: DataTypes.INTEGER,
      references: {
        model: Sale,
        key: "id",
      },
    },
    VehicleIds: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: Object.values(productionStatuses)[0],
      validate: {
        isIn: {
          args: [Object.values(productionStatuses)],
          msg: "Invalid status value",
        },
      },
    },
  },
  {
    paranoid: true,
  }
);

// Sale - production
Sale.hasOne(Production);
Production.belongsTo(Sale);

Production.hasMany(Delivery);
Delivery.belongsTo(Production);

// user - production
User.hasMany(Production, { foreignKey: "creatorId", as: "createdProductions" });
User.hasMany(Production, { foreignKey: "updaterId", as: "updatedProductions" });
Production.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Production.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

module.exports = Production;

/* 
{
  "status": "BEING PRODUCED",
  "VehicleIds": [
    1,
    2
  ]
}
*/
