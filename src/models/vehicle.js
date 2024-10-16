"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");

const { vehicleStatuses } = require("../constraints/roles&status");
const { User } = sequelize.models;


const Vehicle = sequelize.define(
  "Vehicle",
  {
    DriverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      unique: {
        name: "unique_driver_constraint",
        msg: "The selected user is already assigned to another whicle.",
      },
    },
    plateNumber: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: {
        name: "unique_plateNumber_constraint",
        msg: "Plate number must be unique!",
      },
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
      allowNull: false,
      defaultValue: Object.keys(vehicleStatuses)[0],
      validate: {
        isIn: {
          args: [Object.keys(vehicleStatuses)],
          msg: "Invalid status value",
        },
      },
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: async (vehicle) => {
        const user = await User.findByPk(vehicle.DriverId);
        if (user.role !== 1)
          throw new Error("The selected user is not a driver !");
      },
    },
  }
);


module.exports = Vehicle;

/* 
{
  "DriverId": 1,
  "plateNumber": "dada7049",
  "model": 2000,
  "capacity": 7
}
*/
