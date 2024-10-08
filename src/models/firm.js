"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const { firmStatuses } = require("../constraints/roles&status");

const Firm = sequelize.define(
  "Firm",
  {
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      set(value) {
        this.setDataValue("name", value.toUpperCase());
      },
    },
    address: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    phoneNo: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: {
        name: "unique_phone_constraint",
        msg: "This phone number is already in use.",
      },
    },
    tpinNo: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: {
        name: "unique_tpinNo_constraint",
        msg: "Tpin Number should be unique.",
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: "unique_email_constraint",
        msg: "This email address is already in use.",
      },
      validate: {
        isEmail: {
          msg: "Invalid email format",
        },
      },
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: Object.keys(firmStatuses)[0],
      validate: {
        isIn: {
          args: [Object.keys(firmStatuses)],
          msg: "Invalid status value",
        },
      },
    },
  },
  {
    paranoid: true,
  }
);

module.exports = Firm;

/* 
{
  "name": "B",
  "address": "Ibex",
  "phoneNo": "+2602222",
  "tpinNo": "22222",
  "email": "B@gmail.com",
  "status": "SUPPLIER"
}
*/