"use strict";

const Material = require("../models/material");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Material']
        #swagger.summary = 'List All Materials'
        #swagger.description = `<b>-</b> Only Admin can view all materials.`
        #swagger.parameters['showDeleted'] = {
            in: 'query',
            type: 'boolean',
            description:'Includes deleted materials as well, default value is false'
          }
    */
    const data = await Material.findAndCountAll();

    res.status(200).send(data);
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['Material']
        #swagger.summary = 'Material: Create'
        #swagger.description = 'Create with name and unitType'
        #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            "name": "MaterialName",
            "unitType": "testType"
          }
        }
    */
    const material = await Material.findOne({
      where: { name: req.body.name.toUpperCase() },
    });
    if (material)
      throw new Error("This material is already exist in DataBase !");

    req.body.creatorId = req.user.id;
    const data = await Material.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Material']
        #swagger.summary = 'Read Material with id'
        #swagger.description = `<b>-</b> Send access token in header.`
    */
    const data = await Material.findByPk(req.params.id);
    if (!data) {
      res.errorStatusCode = 404;
      throw new Error("Not found !");
    }

    res.status(200).send(data);
  },
  update: async (req, res) => {
    /* 
        #swagger.tags = ['Material']
        #swagger.summary = 'Update material with id'
        #swagger.description = `<b>-</b> Send access token in header.`
        required: true,
          schema: {
            unitType :'updatedType'
          }
    */
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
    /* 
        #swagger.tags = ['Material']
        #swagger.summary = 'Delete material with ID'
        #swagger.description = `<b>-</b> Send access token in header.`
    */
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
    /* 
        #swagger.tags = ['Material']
        #swagger.summary = 'Restore deleted material with ID'
        #swagger.description = `<b>-</b> Send access token in header.`
    */
    const material = await Material.findByPk(req.params.id, {
      paranoid: false,
    });
    if (!material) throw new Error("Material not Found.");
    material.updaterId = req.user.id;
    const isRestored = await material.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Material restored successfuly."
        : "Material not found or something went wrong.",
    });
  },
};
