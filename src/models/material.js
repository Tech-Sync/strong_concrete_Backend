"use strict";
const { sequelize, DataTypes } = require("../configs/dbConnection");
const User = require("./user");

const Material = sequelize.define(
  "Material",
  {
    name: {
      type: DataTypes.STRING(32),
      allowNull: false,
      set(value) {
        this.setDataValue("name", value.toUpperCase());
      },
    },
    unitType: {
      type: DataTypes.STRING(32),
      allowNull: false,
      set(value) {
        this.setDataValue(
          "unitType",
          value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
        );
      },
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      set(value) {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          this.setDataValue("quantity", parseFloat(numericValue.toFixed(2)));
        } else {
          this.setDataValue("quantity", 0);
        }
      },
    },
  },
  {
    paranoid: true,
  }
);

// user - material
User.hasMany(Material, { foreignKey: "creatorId", as: "createdMaterials" });
User.hasMany(Material, { foreignKey: "updaterId", as: "updatedMaterials" });
Material.belongsTo(User, { foreignKey: "creatorId", as: "creator" });
Material.belongsTo(User, { foreignKey: "updaterId", as: "updater" });

module.exports = Material;


/* 
{
  "name": "cement",
  "unitType": "kg"
}
*/