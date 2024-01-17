"use strict";

const Production = require("../models/production");
const Vehicle = require("../models/vehicle");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
     */
    const data = await Vehicle.findAndCountAll({
      // include: { model: Production },
    });

    res.status(200).send(data);
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
     */
    req.body.creatorId = req.user.id;
    const data = await Vehicle.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
     */
    const data = await Vehicle.findByPk(req.params.id);
    if (!data) throw new Error("Vehicle not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
     */
    req.body.updaterId = req.user.id;
    const isUpdated = await Vehicle.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await Vehicle.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
     */
    const vehicle = await Vehicle.findByPk(req.params.id);
    vehicle.updaterId = req.user.id;
    const isDeleted = await vehicle.destroy();

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "Vehicle deleted successfuly."
        : "Vehicle not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
     */
    const vehicle = await Vehicle.findByPk(req.params.id, { paranoid: false });
    if (!vehicle) throw new Error("Vehicle not Found.");
    vehicle.updaterId = req.user.id;
    const isRestored = await vehicle.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Vehicle restored successfuly."
        : "Vehicle not found or something went wrong.",
    });
  },
};
