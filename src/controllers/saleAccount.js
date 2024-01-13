"use strict";

const SaleAccount = require("../models/saleAccount");

module.exports = {
  list: async (req, res) => {

    const data = await SaleAccount.findAndCountAll({});


    res.status(200).send(data);
  },

  create: async (req, res) => {
    req.body.creatorId = req.user.id;

    const data = await SaleAccount.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    const data = await SaleAccount.findByPk(req.params.id);
    if (!data) throw new Error("SaleAccount not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    req.body.updaterId = req.user.id;
    const isUpdated = await SaleAccount.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await SaleAccount.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    const saleAccount = await SaleAccount.findByPk(req.params.id);
    saleAccount.updaterId = req.user.id;
    const isDeleted = await saleAccount.destroy();

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "SaleAccount deleted successfuly."
        : "SaleAccount not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    const saleAccount = await SaleAccount.findByPk(req.params.id, { paranoid: false });
    if (!saleAccount) throw new Error("SaleAccount not Found.");
    saleAccount.updaterId = req.user.id;
    const isRestored = await saleAccount.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "SaleAccount restored successfuly."
        : "SaleAccount not found or something went wrong.",
    });
  },
};
