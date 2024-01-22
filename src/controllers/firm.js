"use strict";

const Firm = require("../models/firm");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Firm']
        #swagger.summary = 'List All Firms'
        #swagger.description = `
                You can send query with endpoint for search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
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
        #swagger.summary = 'Read Firm with id'
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
        #swagger.summary = 'Update firm with id'
        #swagger.description = `<b>-</b> Send access token in header.`
        required: true,
          schema: {
            address:'updatedAdress'
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
        #swagger.summary = 'Delete firm with ID'
        #swagger.description = `<b>-</b> Send access token in header.`
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
        #swagger.summary = 'Restore deleted firm with ID'
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
};
