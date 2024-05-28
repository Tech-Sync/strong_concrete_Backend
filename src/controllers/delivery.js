"use strict";

const Delivery = require("../models/delivery");
const Product = require("../models/product");
const Production = require("../models/production");
const Sale = require("../models/sale");
const User = require("../models/user");
const Vehicle = require("../models/vehicle");

module.exports = {
  list: async (req, res) => {
    /* 
      #swagger.tags = ['Delivery']
      #swagger.summary = 'List All Deliveries'
      #swagger.description = `You can send query with endpoint for search[], sort[], page and limit.
          <ul> Examples:
              <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
              <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
              <li>URL/?<b>page=2&limit=1</b></li>
          </ul>
        `
        #swagger.parameters['showDeleted'] = {
        in: 'query',
        type: 'boolean',
        description:'Send true to show deleted data as well, default value is false'
      }
    */
    const data = await req.getModelList(Delivery, {}, [{
      model: Vehicle,
      attributes: ["id", "plateNumber", "status"],
      include: [{
        model: User,
        as: 'driver',
        attributes: ["firstName", "lastName"],
      }]
    },
    {
      model: Production,
      attributes: ["id",],
      include: [{
        model: Sale,
        attributes: ["id", "location", "sideContact", "orderDate",],
        include: [{
          model: Product,
          attributes: ["id", "name",]
        }]
      }]
    }
    ]);

    res.status(200).send({
      details: await req.getModelListDetails(Delivery),
      data,
    });
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
            ProductionId: "number",
            VehicleId: "number",
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
          status: "number"
        }
      } 
    */
    req.body.updaterId = req.user.id;

    const delivery = await Delivery.findByPk(req.params.id, {
      include: "Vehicle",
    });
    const { Vehicle } = delivery;
    let isUpdated;

    if ((req.user.role === 1 && delivery.Vehicle.DriverId === req.user.id) || req.user.role === 5) {
      const status = req.body.status;
      if (delivery.status > status && req.user.role !== 5) {
        throw new Error("You can not update status to previous value.");
      } else if ([2, 3, 4].includes(status)) {
        Vehicle.status = status + 1;
        await Vehicle.save();
      } else if ([5].includes(status) && req.user.role !== 5) {
        throw new Error("Delivery can not be cancelled from here, talk to saler or admin.");
      }

      isUpdated = await Delivery.update(
        { status },
        {
          where: { id: req.params.id },
          individualHooks: true,
        }
      );
    } else if (delivery.Vehicle.DriverId !== req.user.id && req.body.status) {
      throw new Error("You are not authorized for this action.");
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
      #swagger.description = `
        <b>-</b> Send access token in header. <br>
        <b>-</b> This function returns data includes remaning items.
      `
      #swagger.parameters['hardDelete'] = {
          in: 'query',
          type: 'boolean',
          description:'Send true for hard deletion, default value is false which is soft delete.'}
    */

    const hardDelete = req.query.hardDelete === "true";
    if (req.user.role !== 5 && hardDelete)
      throw new Error("You are not authorized for permanent deletetion!");

    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) throw new Error('Delivery not found or already deleted.')
    delivery.updaterId = req.user.id;
    const isDeleted = await delivery.destroy({ force: hardDelete });

    res.status(isDeleted ? 202 : 404).send({
      error: !Boolean(isDeleted),
      message: !!isDeleted
        ? `The delivery id ${delivery.id} has been deleted.`
        : "Delivery not found or something went wrong.",
      data: await req.getModelList(Delivery),
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
    /* 
      #swagger.tags = ['Delivery']
      #swagger.summary = 'Multiple-Delete  delivery with ID'
      #swagger.description = `
        <b>-</b> Send access token in header. <br>
        <b>-</b> This function returns data includes remaning items.
      `
       #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>You must write the IDs of the deliveries you want to delete into the array.</li>
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
      const delivery = await Delivery.findByPk(id);

      if (delivery) {
        delivery.updaterId = req.user.id;
        await delivery.destroy();
        totalDeleted++;
      }
    }

    res.status(totalDeleted ? 204 : 404).send({
      error: !Boolean(totalDeleted),
      message: !!totalDeleted
        ? `The delivery id's ${ids} has been deleted.`
        : "Delivery not found or something went wrong.",
      data: await req.getModelList(Delivery),
    });
  },
};
