"use strict";

const Production = require("../models/production");
const Vehicle = require("../models/vehicle");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
        #swagger.summary = 'List All Vehicles'
        #swagger.description = `<b>-</b> Only Admin can view all vehicles.`
        #swagger.parameters['showDeleted'] = {
            in: 'query',
            type: 'boolean',
            description:'Includes deleted vehicles as well, default value is false'
          }
     */
    const data = await Vehicle.findAndCountAll({
      // include: { model: Production },
    });

    res.status(200).send(data);
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
        #swagger.summary = 'Vehicle: Create'
        #swagger.description = 'Create with plateNumber, model and capacity'
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            "DriverId": 1,
            "plateNumber": "dada7049",
            "model": 2000,
            "capacity": 7
          }
        }
     */
    req.body.creatorId = req.user.id;
    const data = await Vehicle.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
        #swagger.summary = 'Read Vehicle with id'
        #swagger.description = `<b>-</b> Send access token in header.`
     */
    const data = await Vehicle.findByPk(req.params.id);
    if (!data) throw new Error("Vehicle not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    /* 
        #swagger.tags = ['Vehicle']
        #swagger.summary = 'Update vehicle with id'
        #swagger.description = `<b>-</b> Send access token in header.`
        required: true,
          schema: {
            plateNumber:'18vtn48'
          }
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
        #swagger.summary = 'Delete vehicle with ID'
        #swagger.description = `<b>-</b> Send access token in header.`
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
        #swagger.summary = 'Restore deleted vehicle with ID'
        #swagger.description = `<b>-</b> Send access token in header.`
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
