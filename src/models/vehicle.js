"use strict"
const { STRING } = require("sequelize");
const { sequelize, DataTypes } = require("../configs/dbConnection");

const roles = {
    5: "Package Loading",
    4: "In transit",
    3: "Package Unloading",
    2: "Vehicle in return",
    1: "Shipment completed"
}; 

const Vehicle= sequelize.define("Vehicle", {
    plateNumber:{
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    model:{
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    capacity:{
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM(Object.keys(roles)),
        allowNull: false,
        defaultValue: "5"
    }

});

module.exports = Vehicle;