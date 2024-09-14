"use strict";

const Material = require("../models/material");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Material']
        #swagger.summary = 'List All Materials'
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
    const data = await req.getModelList(Material);

    res.status(200).send({
      details: await req.getModelListDetails(Material),
      data,
    });
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['Material']
        #swagger.summary = 'Material: Create'
        #swagger.description = 'Create With name and unitType (ton or kilo)'
       #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>unitType must be ton or kilo</li>
              <li>When writing the value of unitType and name, it does not matter whether it is lowercase or uppercase.</li>
            </ul> ',
          required: true,
          schema: {
            name:'string',
            unitType: "string"
          }
        } 
     */
    const material = await Material.findOne({
      where: { name: req.body.name.toUpperCase() },
    });
    if (material) throw new Error("This material is already exist in DataBase !");

    req.body.creatorId = req.user.id;
    const data = await Material.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Material']
        #swagger.summary = 'Read Material With Id'
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
        #swagger.summary = 'Update Material With Id'
        #swagger.description = `<b>-</b> Send access token in header.`
        #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            name:'string',
            unitType: "string"
          }
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
        #swagger.summary = 'Delete Material With Id'
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
    if (req.user.role !== 5 && hardDelete) throw new Error('You are not authorized for permanent deletetion!')

    const material = await Material.findByPk(req.params.id);
    if (!material) throw new Error('Material not found or already deleted.')
    material.updaterId = req.user.id;
    const isDeleted = await material.destroy({ force: hardDelete });

    res.status(isDeleted ? 202 : 404).send({
      error: !Boolean(isDeleted),
      message: !!isDeleted
        ? `The material named ${material.name} has been deleted.`
        : "Material not found or something went wrong.",
      data: await req.getModelList(Material),
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['Material']
        #swagger.summary = 'Restore Deleted Material With Id'
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

  multipleDelete: async (req, res) => {
    /* 
      #swagger.tags = ['Material']
      #swagger.summary = 'Multiple-Delete Materials With Id'
      #swagger.description = `
        <b>-</b> Send access token in header. <br>
        <b>-</b> This function returns data includes remaning items.
      `
       #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>You must write the IDs of the materials you want to delete into the array.</li>
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
      const material = await Material.findByPk(id);

      if (material) {
        material.updaterId = req.user.id;
        await material.destroy();
        totalDeleted++;
      }
    }

    res.status(totalDeleted ? 202 : 404).send({
      error: !Boolean(totalDeleted),
      message: !!totalDeleted
        ? `The material id's ${ids} has been deleted.`
        : "Material not found or something went wrong.",
      data: await req.getModelList(Material),
    });
  },
};
