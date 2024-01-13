"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Sale = require("./sale");
const User = require("./user");
const Vehicle = require("./vehicle");
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
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: (production) => {
        if (!production.status) production.status = "PLANNED";
        production.status = production.status.toUpperCase();

        if (productionStatuses[production.status])
          production.status = productionStatuses[production.status];
        else throw new Error("Invalid role");
      },
      beforeUpdate: (production) => {
        if (production.changed("status")) {
          production.status = production.status.toUpperCase();

          if (productionStatuses[production.status])
            production.status = productionStatuses[production.status];
          else throw new Error("Invalid role");
        }
      },
    },
  }
);

// Sale - production
Sale.hasOne(Production);
Production.belongsTo(Sale);


Vehicle.belongsToMany(Production, { through: Delivery });
Production.belongsToMany(Vehicle, { through: Delivery });

// user - production
User.hasMany(Production, { foreignKey: "creatorId", as: "createdProductions" });
User.hasMany(Production, { foreignKey: "updaterId", as: "updatedProductions" });
Production.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Production.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

module.exports = Production;
