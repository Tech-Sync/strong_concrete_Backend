"use strict";

const  Material  = require("../models/material");

module.exports = {
  list: async (req, res) => {
    const data = await Material.findAndCountAll();
    
    res.status(200).send(data);
  },

  create: async (req, res) => {

    const material = await Material.findOne({where:{name:req.body.name.toUpperCase()}})
    if(material) throw new Error('This material is already exist in DataBase !')

    req.body.creatorId = req.user.id;
    const data = await Material.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    const data = await Material.findByPk(req.params.id);
    if (!data) throw new Error("Material not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    req.body.updaterId = req.user.id;
    const isUpdated = await Material.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await Material.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    const material = await Material.findByPk(req.params.id);
    material.updaterId = req.user.id;
    const isDeleted = await material.destroy();

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "Material deleted successfuly."
        : "Material not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    const material = await Material.findByPk(req.params.id,{ paranoid: false });
    if (!material) throw new Error("Material not Found.");
    material.updaterId = req.user.id
    const isRestored = await material.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Material restored successfuly."
        : "Material not found or something went wrong.",
    });
  },
};
