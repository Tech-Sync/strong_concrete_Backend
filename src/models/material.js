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
        this.setDataValue("quantity", value.toFixed(2));
      },
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeUpdate: (material) => {
        material.quantity = material.quantity.toFixed(2)
      },
    },
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