"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const User = require("./user");

const statuses = {
  HOME: 1,
  "READY FOR LOADING": 2,
  "PACKAGE LOADING": 3,
  "IN TRANSIT": 4,
  "PACKAGE UNLOADING": 5,
  "VEHICLE IN RETURN": 6,
};

const Vehicle = sequelize.define(
  "Vehicle",
  {
    plateNumber: {
      type: DataTypes.STRING(32),
      allowNull: false,
      set(value) {
        this.setDataValue("plateNumber", value.toUpperCase());
      },
    },
    model: {
      type: DataTypes.INTEGER,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: (vehicle) => {
        if (!vehicle.status) vehicle.status = "HOME";

        if (statuses[vehicle.status]) {
          vehicle.status = statuses[vehicle.status];
        } else {
          throw new Error("Invalid role");
        }
      },
      beforeUpdate: (vehicle) => {
        if (vehicle.changed("status")) {
          if (statuses[vehicle.status])
            vehicle.status = statuses[vehicle.status];
          else throw new Error("Invalid role");
        }
      },
    },
  }
);

// user - account
User.hasMany(Vehicle, { foreignKey: "creatorId", as: "createdVehicles" });
User.hasMany(Vehicle, { foreignKey: "updaterId", as: "updatedVehicles" });
Vehicle.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Vehicle.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

module.exports = Vehicle;
