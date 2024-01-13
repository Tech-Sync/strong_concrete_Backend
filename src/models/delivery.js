"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const Production = require("./production");
const User = require("./user");
const Vehicle = require("./vehicle");
const { deliveryStatuses } = require("../constraints/roles&status");

const Delivery = sequelize.define(
  "Delivery",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    
    status: {
      type: DataTypes.INTEGER,
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: (delivery) => {
        if (!delivery.status) delivery.status = "LOADING";
        delivery.status = delivery.status.toUpperCase();

        if (deliveryStatuses[delivery.status])
          delivery.status = deliveryStatuses[delivery.status];
        else throw new Error("Invalid role");
      },
      beforeUpdate: (delivery) => {
        if (delivery.changed("status")) {
          delivery.status = delivery.status.toUpperCase();

          if (deliveryStatuses[delivery.status])
            delivery.status = deliveryStatuses[delivery.status];
          else throw new Error("Invalid role");
        }
      },
    },
  }
);

// user - delivery
User.hasMany(Delivery, { foreignKey: "creatorId", as: "createdDeliverys" });
User.hasMany(Delivery, { foreignKey: "updaterId", as: "updatedDeliverys" });
Delivery.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Delivery.belongsTo(User, { foreignKey: "updaterId", as: "updater" });



module.exports = Delivery;
