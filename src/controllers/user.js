"use strict";

const passwordEncrypt = require("../helpers/passEncrypt");

const User = require("../models/user");

module.exports = {
  list: async (req, res) => {
    console.log(req.user);
    const data = await User.findAndCountAll();
    res.status(200).send({
      result: data,
    });
  },

  create: async (req, res) => {
    const data = await User.create(req.body);
    res.status(201).send({
      data,
    });
  },

  read: async (req, res) => {
    const data = await User.findByPk(req.params.id);
    res.status(200).send({
      data,
    });
  },
  update: async (req, res) => {
    const isUpdated = await User.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });
    // isUpdated return: [ 1 ] or [ 0 ]
    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await User.findByPk(req.params.id),
    });
  },

  uptadePassword: async (req, res) => {
    const { password, newPassword, reNewPassword } = req.body;
    const user = await User.findOne({
      where: { password: passwordEncrypt(password) },
    });
    if (!user) {
      res.errorStatusCode = 402;
      throw new Error("Check your current password! ");
    }
    if (newPassword == password) {
      throw new Error(
        "Your new password must be different from your old password!"
      );
    } else if (newPassword !== reNewPassword) {
      throw new Error(
        "new Password, reNew Password must be the same"
      );
    } else {
      const updatedUser = await User.update(newPassword,{where:
        {password: passwordEncrypt(password)},
      });
      res.status(200).send({ message: "Password updated successfully!" });
    }
  },

  delete: async (req, res) => {
    const isDeleted = await User.destroy({ where: { id: req.params.id } });
    res.status(isDeleted ? 204 : 404).send({
      error: Boolean(isDeleted),
    });
  },
};
