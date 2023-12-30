"use strict"
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
        allowNull:false,
    },
    capacity:{}
})