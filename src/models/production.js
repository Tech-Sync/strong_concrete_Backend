"use strict";
const { STRING } = require("sequelize");
const { sequelize, DataTypes } = require("../configs/dbConnection");

const roles = {
  2: "Done",
  1: "In Progress",
};

const Production = sequelize.define("Production", {
  status: {

  },
  creatorId: {

  },
  updaterId: {

  },
  vehicleId: {

  },
  saleId: {
    
  },
});
