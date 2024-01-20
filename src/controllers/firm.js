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
      */
    const name = req.body?.name.toUpperCase()
    const firm = await Firm.findOne({where:{name}})
    if (firm) throw new Error("With this name, Firm is already exist in DataBase !");
    req.body.creatorId = req.user.id;
    const data = await Firm.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Firm']
    */
    const data = await Firm.findByPk(req.params.id);
    if (!data) {
      res.errorStatusCode = 404;
      throw new Error("Not found !");
    }

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
