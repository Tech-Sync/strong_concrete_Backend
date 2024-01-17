"use strict";

const Delivery = require("../models/delivery");
const Vehicle = require("../models/vehicle");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Delivery']
    */
    const data = await Delivery.findAndCountAll();

    res.status(200).send(data);
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['Delivery']
    */
    req.body.creatorId = req.user.id;
    const data = await Delivery.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Delivery']
    */
    const data = await Delivery.findByPk(req.params.id);

    if (!data) throw new Error("Delivery not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    /* 
        #swagger.tags = ['Delivery']
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
    */
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
    /* 
        #swagger.tags = ['Delivery']
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
};
