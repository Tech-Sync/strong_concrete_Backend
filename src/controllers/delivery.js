"use strict";

const Delivery = require("../models/delivery");
const Vehicle = require("../models/vehicle");

module.exports = {
  list: async (req, res) => {
    /* 
      #swagger.tags = ['Delivery']
      #swagger.summary = 'List All Deliveries'
      #swagger.parameters['showDeleted'] = {
        in: 'query',
        type: 'boolean',
        description:'Includes deleted delivery as well, Default value is false'
      }
    */
    const data = await Delivery.findAndCountAll();

    res.status(200).send(data);
  },

  create: async (req, res) => {
    /* 
      #swagger.tags = ['Delivery']
      #swagger.deprecated  = true
      #swagger.description = `
        <b>-</b> Delivery is created automatically after production status change to BEING PRODUCED. <br>
        <b>-</b> No need to create delivery manuel.
        <b>-</b> Send access token in header.`
      #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>ProductionId is an integer and should be gotten from production table</li>
              <li>VehicleId is an integer and should be gotten from vehicle table</li>
            </ul> ',
          required: true,
          schema: {
            ProductionId: 54245232,
            VehicleId: 9,
          }
        } 
    */
    req.body.creatorId = req.user.id;
    const data = await Delivery.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
      #swagger.tags = ['Delivery']
      #swagger.summary = 'Read Delivery with id'
      #swagger.description = `<b>-</b> Send access token in header.`
    */
    const data = await Delivery.findByPk(req.params.id);

    if (!data) {
      res.errorStatusCode = 404;
      throw new Error("Not found !");
    }

    res.status(200).send(data);
  },
  update: async (req, res) => {
    /* 
      #swagger.tags = ['Delivery']
      #swagger.summary = 'Update delivery with id'
      #swagger.description = `<b>-</b> Send access token in header.`
      #swagger.parameters['body'] = {
        in: 'body',
        description: '
          <ul> 
            <li>Send the object includes attributes that should be updated.</li>
            <li>Status is integer value.</li>
            <li>VehicleId is not able to be updated by driver from this stage.</li>
          </ul> ',
        required: true,
        schema: {
          status: 2
        }
      } 
    */
    req.body.updaterId = req.user.id;

    const delivery = await Delivery.findByPk(req.params.id, {
      include: "Vehicle",
    });
    const { Vehicle } = delivery;
    let isUpdated;

    if (req.user.role === 1 && delivery.Vehicle.DriverId === req.user.id) {
      const status = req.body.status;

      if ([2, 3, 4].includes(status)) {
        Vehicle.status = status + 1;
        await Vehicle.save();
      } else if ([5].includes(status)) {
        throw new Error(
          "Delivery can not be cancelled from here, talk to saler or admin."
        );
      }

      isUpdated = await Delivery.update(
        { status },
        {
          where: { id: req.params.id },
          individualHooks: true,
        }
      );
    } else {
      isUpdated = await Delivery.update(req.body, {
        where: { id: req.params.id },
        individualHooks: true,
      });
    }

    res.status(202).send({
      isUpdated: isUpdated && Boolean(isUpdated[0]),
      data: await Delivery.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    /* 
      #swagger.tags = ['Delivery']
      #swagger.summary = 'Delete delivery with ID'
      #swagger.description = `<b>-</b> Send access token in header.`
    */
    const delivery = await Delivery.findByPk(req.params.id);
    delivery.updaterId = req.user.id;
    const isDeleted = await delivery.destroy();

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message:"Delivery not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    /* 
      #swagger.tags = ['Delivery']
      #swagger.summary = 'Restore deleted delivery with ID'
      #swagger.description = `<b>-</b> Send access token in header.`
    */
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

  multipleDelete: async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new Error('Invalid or empty IDs array in the request body.');
    }

    let totalDeleted = 0;

    for (const id of ids) {
        const delivery = await Delivery.findByPk(id);

        if (delivery) {
            
            delivery.updaterId = req.user.id;
            await delivery.destroy();
            totalDeleted++;
        }
    }

    res.status(totalDeleted ? 204 : 404).send({
        error: !Boolean(totalDeleted),
        message: "Delivery not found or something went wrong."
    });
},
};
