"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Production = require("./production");
const User = require("./user");

const statuses = {
  4: "Cancelled",
  3: "Delivered",
  2: "On the Way",
  1: "Preparing",
};

const Delivery = sequelize.define(
  "Delivery",
  {
    ProductionId: {
      type: DataTypes.INTEGER,
      references: {
        model: Production,
        key: "id",
      },
    },
    DriverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM,
      values: Object.values(statuses),
      defaultValue: "Preparing",
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: (delivery) => {
        if (statuses[delivery.status]) {
          delivery.status = statuses[delivery.status];
        } else {
          throw new Error("Invalid role");
        }
      },
    },
  }
);

// Production - delivery
Production.hasOne(Delivery);
Delivery.belongsTo(Production);

// user - delivery
User.hasMany(Delivery, { foreignKey: "DriverId", as: "driverDeliverys" });
User.hasMany(Delivery, { foreignKey: "creatorId", as: "createdDeliverys" });
User.hasMany(Delivery, { foreignKey: "updaterId", as: "updatedDeliverys" });
Delivery.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Delivery.belongsTo(User, { foreignKey: "updaterId", as: "updater" });
Delivery.belongsTo(User, { foreignKey: "DriverId", as: "driver" });

module.exports = Delivery;
