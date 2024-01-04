"use strict";

const { sequelize } = require("../configs/dbConnection");
const Account = require("../models/account");

module.exports = {
  list: async (req, res) => {
    const data = await Account.findAndCountAll({
      include: ["Firm", "Stock"],
    });

    res.status(200).send(data);
  },

  create: async (req, res) => {
    req.body.creatorId = req.user.id;
    const data = await Account.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    const data = await Account.findByPk(req.params.id);
    console.log(data.get("formatCreateAt"));
    if (!data) throw new Error("Account not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    req.body.updaterId = req.user.id;
    const isUpdated = await Account.update(req.body, {
      where: { id: req.params.id },
    });

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await Account.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    const account = await Account.findByPk(req.params.id);
    account.updaterId = req.user.id;
    const isDeleted = await account.destroy();

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "Account deleted successfuly."
        : "Account not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    const account = await Account.findByPk(req.params.id, { paranoid: false });
    if (!account) throw new Error("Account not Found.");
    account.updaterId = req.user.id;
    const isRestored = await account.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Account restored successfuly."
        : "Account not found or something went wrong.",
    });
  },
};
