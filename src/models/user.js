const { sequelize, DataTypes } = require("../configs/dbConnection");
const passwordEncrypt = require("../helpers/passEncrypt");

const roles = {
  5: "ADMIN",
  4: "SALER",
  3: "ACCOUNTANT",
  2: "PRODUCER",
  1: "DRIVER",
};

const User = sequelize.define(
  "User",
  {
    firstName: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    nrcNo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: {
        name: "unique_nrcNo_constraint",
        msg: "This nrc no is already in use.",
      },
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
      type: DataTypes.STRING,
      allowNull: false,
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
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailToken: { type: DataTypes.STRING },
  },
  { paranoid: true }
);

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

  if (roles[user.role]) {
    user.role = roles[user.role];
  } else {
    throw new Error("Invalid role");
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    const isPasswordValidated =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+.,])[A-Za-z\d@$!%*?&+.,].{8,}$/.test(
        user.password
      );

    if (isPasswordValidated)
      user.password = await passwordEncrypt(user.password);
    else throw new Error("Password not validated.");
  }
  if (user.changed("role")) {
    if (roles[user.role]) user.role = roles[user.role];
    else throw new Error("Invalid role");
  }
});



module.exports = User;
