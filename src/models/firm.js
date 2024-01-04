"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const User = require("./user");

const statusOption = {
  2: "SUPPLIER",
  1: "CONSUMER",
};

const Firm = sequelize.define(
  "Firm",
  {
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
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
        msg: "TpinNo should be unique.",
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
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [Object.values(statusOption)],
          msg: "Invalid role",
        },
      },
      set(value) {
        this.setDataValue("status", statusOption[value]);
      },
    },
  },
  { paranoid: true }
);


module.exports = Firm;
