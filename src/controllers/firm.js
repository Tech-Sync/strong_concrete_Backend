"use strict";

const Firm = require("../models/firm");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Firm']
    */
    const data = await Firm.findAndCountAll();

    res.status(200).send(data);
  },

  create: async (req, res) => {
    /* 
      #swagger.tags = ['Firm']
      #swagger.summary = 'Firm: Create'
      #swagger.description = 'Create with name, address, phoneNo, tpinNo, email and status'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            "name": "FirmName",
            "address": "FirmAdress",
            "phoneNo": "+2602222",
            "tpinNo": "22222",
            "email": "firm@gmail.com",
            "status": "1 or 2"
          }
        }
      */

    req.body.creatorId = req.user.id;
    const data = await Firm.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Firm']
    */
    const data = await Firm.findByPk(req.params.id);
    if (!data) throw new Error("Firm not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    /* 
        #swagger.tags = ['Firm']
    */
    req.body.updaterId = req.user.id;
    const isUpdated = await Firm.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await Firm.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    /* 
        #swagger.tags = ['Firm']
    */
    const firm = await Firm.findByPk(req.params.id);
    firm.updaterId = req.user.id;
    const isDeleted = await firm.destroy();

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "Firm deleted successfuly."
        : "Firm not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['Firm']
    */
    const firm = await Firm.findByPk(req.params.id, { paranoid: false });
    if (!firm) throw new Error("Firm not Found.");
    firm.updaterId = req.user.id;
    const isRestored = await firm.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Firm restored successfuly."
        : "Firm not found or something went wrong.",
    });
  },
};
