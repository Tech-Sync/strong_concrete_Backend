"use strict";
const { STRING } = require("sequelize");
const { sequelize, DataTypes } = require("../configs/dbConnection");

const roles = {
  2: "Done",
  1: "In Progress",
};

const Production = sequelize.define("Production", {
  status: {
    type: DataTypes.ENUM(Object.keys(roles)),
    allowNull: false,
    defaultValue:1
  },

  creatorId: {                      // referans alacağımız yer var mı?
    type: DataTypes.INTEGER,
    allowNull: false
  },

  updaterId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'Vehicle', 
        key: 'id',
  }},

  saleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'Sales', 
        key: 'id',
  }},
  
});
