"use strict";

const { decode } = require("../helpers/encode&decode");
const sendEmail = require("../helpers/sendEmail");
const passwordEncrypt = require("../helpers/passEncrypt");

const  User  = require("../models/user");

module.exports = {
  list: async (req, res) => {
    const data = await User.findAndCountAll({ paranoid: false }); // to see deleted users as well -> findAndCountAll({paranoid:false})
    
    res.status(200).send({
      error:false,
      details: await req.getModelListDetails(User),
      data}
      );
  },

  read: async (req, res) => {
    const data = await User.findByPk(req.params.id);
    if (!data) throw new Error("User not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    const isUpdated = await User.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await User.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    const isDeleted = await User.destroy({ where: { id: req.params.id } }); // add this att. for hard delete ->   force: true

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "User deleted successfuly."
        : "User not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    const isRestored = await User.restore({ where: { id: req.params.id } });

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "User restored successfuly."
        : "User not found or something went wrong.",
    });
  },

  uptadePassword: async (req, res) => {
    const { password, newPassword, reNewPassword } = req.body;
    const { id } = req.user;
    const user = await User.findOne({
      where: { id },
    });

    if (!user) {
      res.errorStatusCode = 402;
      throw new Error("User not found! ");
    }
    if (user.password != passwordEncrypt(password)) {
      throw new Error("Current password didn't match!");
    }

    if (passwordEncrypt(password) === passwordEncrypt(newPassword)) {
      throw new Error("new Password, can't be old  password!");
    }
    if (newPassword != reNewPassword) {
      throw new Error("new Password, reNew Password must be the same");
    }

    user.password = newPassword;
    await user.save();
    res.status(200).send({ message: "Password updated successfully!", user });
  },

  forgetPassword: async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Email verification failed, invalid Email !");
    if (!user.isActive)
      throw new Error(
        "You do not have the appropriate authorizations for this operation."
      );
    // userInfo, fileName, Subject
    sendEmail(user, "reset-password", "Reset Password");

    res.status(200).send({
      message: "Email has been sent.",
    });
  },

  resetPassword: async (req, res) => {
    const { uid, emailToken } = req.params;
    const { password, password2 } = req.body;
    const id = decode(uid);

    if (password != password2) throw new Error("Passwords are not matching !");
    const user = await User.findByPk(id);
    if (!user) throw new Error("User Not Found !");
    if (emailToken != user.emailToken) throw new Error("Token Invalid !");
    user.password = password;

    await user.save();

    res.status(200).send({
      message: "Your password has been changed successfully.",
    });
  },
};
