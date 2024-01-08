"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Production = require("./production");
const User = require("./user");

const statuses = {
  CANCELLED: 4,
  DELIVERIED: 3,
  "ON THE WAY": 2,
  PREPARING: 1,
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
      type: DataTypes.INTEGER,
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: (delivery) => {
        if (!delivery.status) delivery.status = "PREPARING";

        if (statuses[delivery.status])
          delivery.status = statuses[delivery.status];
        else throw new Error("Invalid role");
      },
      beforeUpdate: (delivery) => {
        if (delivery.changed("status")) {
          if (statuses[delivery.status])
            delivery.status = statuses[delivery.status];
          else throw new Error("Invalid role");
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
