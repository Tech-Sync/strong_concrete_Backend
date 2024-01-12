"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const User = require("./user");
const { firmStatuses } = require("../constraints/roles&status");

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
      type: DataTypes.INTEGER,
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: (firm) => {
        if (!firm.status) firm.status = "CONSUMER";
        firm.status = firm.status.toUpperCase();

        if (firmStatuses[firm.status]) firm.status = firmStatuses[firm.status];
        else throw new Error("Invalid status");
      },
      beforeUpdate: (firm) => {
        if (firm.changed("status")) {
          firm.status = firm.status.toUpperCase();
          
          if (firmStatuses[firm.status])
            firm.status = firmStatuses[firm.status];
          else throw new Error("Invalid status");
        }
        sale.totalPrice =
          sale.quantity * sale.unitPrice + sale.otherCharges - sale.discount;
      },
    },
  }
);

// user - firm
User.hasMany(Firm, { foreignKey: "creatorId", as: "createdFirms" });
User.hasMany(Firm, { foreignKey: "updaterId", as: "updatedFirms" });
Firm.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Firm.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

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