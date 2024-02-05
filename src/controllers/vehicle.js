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
    const data = await req.getModelList(Production);

    res.status(200).send({
      details: await req.getModelListDetails(Production),
      data,
    });
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
      message: "Vehicle not found or something went wrong.",
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
  multipleDelete: async (req, res) => {
     /* 
      #swagger.tags = ['Vehicle']
      #swagger.summary = 'Multiple-Delete  Vehicle with ID'
      #swagger.description = `<b>-</b> Send access token in header.`
       #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>You must write the IDs of the vehicles you want to delete into the array.</li>
            </ul> ',
          required: true,
          schema: {
            "ids": [1,2,3]
            
          }
        } 
    */
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error("Invalid or empty IDs array in the request body.");
    }

    let totalDeleted = 0;

    for (const id of ids) {
      const vehicle = await Vehicle.findByPk(id);

      if (vehicle) {
        vehicle.updaterId = req.user.id;
        await vehicle.destroy();
        totalDeleted++;
      }
    }

    res.status(totalDeleted ? 204 : 404).send({
      error: !Boolean(totalDeleted),
      message: "vehicles not found or something went wrong.",
    });
  },
};
