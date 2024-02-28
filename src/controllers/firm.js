"use strict";

const Firm = require("../models/firm");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Firm']
        #swagger.summary = 'List All Firms'
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

    const data = await req.getModelList(Firm);

    res.status(200).send({
      details: await req.getModelListDetails(Firm),
      data,
    });
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
            "name": "string",
            "address": "string",
            "phoneNo": "string",
            "tpinNo": "string",
            "email": "string",
            "status": "number"
          }
        }
      */
    const name = req.body?.name.toUpperCase();
    const firm = await Firm.findOne({ where: { name } });
    
    if (firm) throw new Error(`${firm.name} name is already in used!`);
    req.body.creatorId = req.user.id;
    const data = await Firm.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Firm']
        #swagger.summary = 'Read Firm With Id'
        #swagger.description = `<b>-</b> Send access token in header.`
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
        #swagger.summary = 'Update Firm With Id'
        #swagger.description = `<b>-</b> Send access token in header.`
        #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>Send the object includes attributes that should be updated.</li>
              <li>You can update : name, address, phoneNo, tpinNo, email and status .</li>
            </ul> ',
          required: true,
          schema: {
            "name": "string",
            "address": "string",
            "phoneNo": "string",
            "tpinNo": "string",
            "email": "string",
            "status": "number"
          }
        } 
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
        #swagger.summary = 'Delete Firm With Id'
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

    const firm = await Firm.findByPk(req.params.id);
    if (!firm) throw new Error("Firm not found or already deleted.");
    firm.updaterId = req.user.id;
    const isDeleted = await firm.destroy({ force: hardDelete });

    res.status(isDeleted ? 202 : 404).send({
      error: !Boolean(isDeleted),
      message: !!isDeleted
        ? `The company named ${firm.name} has been deleted.`
        : "Firm not found or something went wrong.",
      data: await req.getModelList(Firm),
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['Firm']
        #swagger.summary = 'Restore Deleted Firm With Id'
        #swagger.description = `<b>-</b> Send access token in header.`
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

  multipleDelete: async (req, res) => {
    /* 
      #swagger.tags = ['Firm']
      #swagger.summary = 'Multiple-Delete Firms With Id'
      #swagger.description = `
        <b>-</b> Send access token in header. <br>
        <b>-</b> This function returns data includes remaning items.
      `
      #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>You must write the IDs of the firms you want to delete into the array.</li>
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
      const firm = await Firm.findByPk(id);

      if (firm) {
        firm.updaterId = req.user.id;
        await firm.destroy();
        totalDeleted++;
      }
    }

    res.status(totalDeleted ? 202 : 404).send({
      error: !Boolean(totalDeleted),
      message: !!totalDeleted
        ? `The company id's ${ids} has been deleted.`
        : "Firm not found or something went wrong.",
      data: await req.getModelList(Firm),
    });
  },
};
