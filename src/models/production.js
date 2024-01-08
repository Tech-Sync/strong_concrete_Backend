"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Sale = require("./sale");
const User = require("./user");
const Vehicle = require("./vehicle");

const statuses = {
  CANCELLED: 4,
  COMPLETED: 3,
  "IN PROGRESS": 2,
  PLANNED: 1,
};

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
    VehicleId: {
      type: DataTypes.INTEGER,
      references: {
        model: Vehicle,
        key: "id",
      },
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

        if (statuses[production.status]) {
          production.status = statuses[production.status];
        } else {
          throw new Error("Invalid role");
        }
      },
      beforeUpdate: (production) => {
        if (production.changed("status")) {
          if (statuses[production.status])
            production.status = statuses[production.status];
          else throw new Error("Invalid role");
        }
      },
    },
  }
);

// Sale - production
Sale.hasOne(Production);
Production.belongsTo(Sale);

// Vehicle - production
Vehicle.hasMany(Production);
Production.belongsTo(Vehicle);

// user - production
User.hasMany(Production, { foreignKey: "creatorId", as: "createdProductions" });
User.hasMany(Production, { foreignKey: "updaterId", as: "updatedProductions" });
Production.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Production.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

module.exports = Production;
