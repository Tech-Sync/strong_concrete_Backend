"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const User = require("./user");

const statuses = {
  1: "Home",
  2: "Ready for Loading",
  3: "Package Loading",
  4: "In transit",
  5: "Package Unloading",
  6: "Vehicle in return",
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
      type: DataTypes.ENUM,
      values: Object.values(statuses),
      defaultValue: "Home",
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
        if (statuses[vehicle.status]) {
          vehicle.status = statuses[vehicle.status];
        } else {
          throw new Error("Invalid role");
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
