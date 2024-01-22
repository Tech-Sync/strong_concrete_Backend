"use strict";

const SaleAccount = require("../models/saleAccount");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Sale Account']
        #swagger.summary = ' Sale Account List'
        #swagger.description = '
        <b>-</b> You can send query with endpoint for search[], sort[], page and limit. <br>
        
                <ul> Examples:
                    <li><b>SEARCHING: URL?search[FirmId]=3&search[quantity]=20</b></li>
                    <li><b>SORTING: URL?sort[quantity]=desc&sort[totalPrice]=asc</b></li>
                    <li><b>PAGINATION: URL?page=1&limit=10&offset=10</b></li>
                    <li><b>DATE FILTER: URL?startDate=2023-07-13&endDate=2023-10-01  The date must be in year-month-day format</b></li>
                </ul>'
    */
    const data = await SaleAccount.findAndCountAll({});

    res.status(200).send(data);
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['Sale Account']
        #swagger.summary = 'Sale Account Create'
        #swagger.description = '
          <b>-</b> SaleAccount will be created automatically after the sale is made. <br>
          <b>-</b> Send access token in header.'
        #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        
      }
    */
    req.body.creatorId = req.user.id;

    const data = await SaleAccount.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Sale Account']
         #swagger.summary = 'Read Sale Account with id'
        #swagger.description = '
       <b>-</b> Send access token in header. '
    */
    const data = await SaleAccount.findByPk(req.params.id);
    if (!data) {
      res.errorStatusCode = 404;
      throw new Error("Not found !");
    }

    res.status(200).send(data);
  },
  update: async (req, res) => {
    /* 
        #swagger.tags = ['Sale Account']
        #swagger.summary = 'Update Sale Account with id'
        #swagger.description = `<b>-</b> Send access token in header.`
        #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>Send the object includes attributes that should be updated.</li>
              
            </ul> ',
          required: true,
          schema: {
            FirmId:'test1'
          }
        } 
    */
    req.body.updaterId = req.user.id;
    const isUpdated = await SaleAccount.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await SaleAccount.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    /* 
        #swagger.tags = ['Sale Account']
        #swagger.summary = 'Delete Sale Account with id'
        #swagger.description = '<b>-</b> Send access token in header.'
    */
    const saleAccount = await SaleAccount.findByPk(req.params.id);
    saleAccount.updaterId = req.user.id;
    const isDeleted = await saleAccount.destroy();

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "SaleAccount deleted successfuly."
        : "SaleAccount not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['Sale Account']
         #swagger.summary = 'Restore deleted Sale Account with id'
        #swagger.description = `<b>-</b> Send access token in header.`
    */
    const saleAccount = await SaleAccount.findByPk(req.params.id, {
      paranoid: false,
    });
    if (!saleAccount) throw new Error("SaleAccount not Found.");
    saleAccount.updaterId = req.user.id;
    const isRestored = await saleAccount.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "SaleAccount restored successfuly."
        : "SaleAccount not found or something went wrong.",
    });
  },
};
