"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Sale = require("./sale");
const User = require("./user");
const Vehicle = require("./vehicle");

const statuses = {
  4: "Cancelled",
  3: "Completed",
  2: "In Progress",
  1: "Planned",
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
      type: DataTypes.ENUM,
      values: Object.values(statuses),
      defaultValue: "Planned",
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: (production) => {
        if (statuses[production.status]) {
          production.status = statuses[production.status];
        } else {
          throw new Error("Invalid role");
        }
      },
    },
  }
);


// Sale - production
Sale.hasOne(Production)
Production.belongsTo(Sale)

// Vehicle - production
Vehicle.hasMany(Production)
Production.belongsTo(Vehicle)

// user - production
User.hasMany(Production, { foreignKey: "creatorId", as: "createdProductions" });
User.hasMany(Production, { foreignKey: "updaterId", as: "updatedProductions" });
Production.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Production.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

module.exports = Production;
