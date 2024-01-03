"use strict";

const  Stock  = require("../models/stock");

module.exports = {
  list: async (req, res) => {
    const data = await Stock.findAndCountAll();
    
    res.status(200).send(data);
  },

  create: async (req, res) => {
    req.body.creatorId = req.user.id;
    const data = await Stock.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    const data = await Stock.findByPk(req.params.id);
    if (!data) throw new Error("Stock not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    req.body.updaterId = req.user.id;
    const isUpdated = await Stock.update(req.body, {
      where: { id: req.params.id },
    });

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await Stock.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    const stock = await Stock.findByPk(req.params.id);
    stock.updaterId = req.user.id;
    const isDeleted = await stock.destroy();

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "Stock deleted successfuly."
        : "Stock not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    const stock = await Stock.findByPk(req.params.id,{ paranoid: false });
    if (!stock) throw new Error("Stock not Found.");
    stock.updaterId = req.user.id
    const isRestored = await stock.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Stock restored successfuly."
        : "Stock not found or something went wrong.",
    });
  },
};
