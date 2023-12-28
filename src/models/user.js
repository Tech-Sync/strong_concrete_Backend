const { sequelize, DataTypes } = require("../configs/dbConnection");
const passwordEncrypt = require("../helpers/passEncrypt");

const User = sequelize.define("User", {
  firstName: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  nrcNo: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
  },
  phoneNO: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: "Invalid email format",
      },
      notEmpty: {
        msg: "Email cannot be empty",
      },
    },
  },
  password: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

User.beforeCreate(async (user) => {
  if (user.password) {
    const isPasswordValidated =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+.,])[A-Za-z\d@$!%*?&+.,].{8,}$/.test(
        user.password
      );

    if (isPasswordValidated) {
      user.password = await passwordEncrypt(user.password);
    } else {
      throw new Error("Password not validated.");
    }
  }
});

User.beforeUpdate(async (user) => {
  if (user.password) {
    const isPasswordValidated =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+.,])[A-Za-z\d@$!%*?&+.,].{8,}$/.test(
        user.password
      );

    if (isPasswordValidated) {
      user.password = await passwordEncrypt(user.password);
    } else {
      throw new Error("Password not validated.");
    }
  }
});


module.exports = User;
