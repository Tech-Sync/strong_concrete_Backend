"use strict";

const Delivery = require("../models/delivery");
const Vehicle = require("../models/vehicle");

module.exports = {
  list: async (req, res) => {
    const data = await Delivery.findAndCountAll();

    res.status(200).send(data);
  },

  create: async (req, res) => {
    req.body.creatorId = req.user.id;
    const data = await Delivery.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    const data = await Delivery.findByPk(req.params.id);

    if (!data) throw new Error("Delivery not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    req.body.updaterId = req.user.id;

    let isUpdated;
    if (!req.body.DriverId && req.body.status)
      throw new Error("No Driver yet, you can not update status !");
    else {
      isUpdated = await Delivery.update(req.body, {
        where: { id: req.params.id },
        individualHooks: true,
      });
    }

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await Delivery.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    const delivery = await Delivery.findByPk(req.params.id);
    delivery.updaterId = req.user.id;
    const isDeleted = await delivery.destroy();

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "Delivery deleted successfuly."
        : "Delivery not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    const delivery = await Delivery.findByPk(req.params.id, {
      paranoid: false,
    });
    if (!delivery) throw new Error("Delivery not Found.");
    delivery.updaterId = req.user.id;
    const isRestored = await delivery.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Delivery restored successfuly."
        : "Delivery not found or something went wrong.",
    });
  },
};
