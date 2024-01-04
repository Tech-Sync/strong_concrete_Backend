"use strict"
const { STRING } = require("sequelize");
const { sequelize, DataTypes } = require("../configs/dbConnection");

const roles = {
    6: "Ready for Loading",
    5: "Package Loading",
    4: "In transit",
    3: "Package Unloading",
    2: "Vehicle in return",
    1: "Shipment completed"
}; 

const Vehicle= sequelize.define("Vehicle", {
    plateNumber:{
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    model:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    capacity:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM(Object.keys(roles)),
        allowNull: false,
        defaultValue: "6"
    },
    isPublic:{
        type: DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true,
    }

});

module.exports = Vehicle;