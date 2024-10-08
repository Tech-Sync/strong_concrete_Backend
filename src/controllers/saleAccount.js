"use strict";


const {Firm, Product, Sale, SaleAccount} = require('../models');

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Sale Account']
        #swagger.summary = ' Sale Account List'
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
    const data = await req.getModelList(SaleAccount, {}, [
      {
        model: Sale,
        attributes: ["id"],
        include: [
          {
            model: Product,
            attributes: ["name"],
          },
        ],
      },
      { model: Firm, attributes: ["name"] },
    ]);

    res.status(200).send({
      details: await req.getModelListDetails(SaleAccount),
      data,
    });
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['Sale Account']
        #swagger.deprecated  = true
        #swagger.summary = 'Sale Account: Create'
        #swagger.description = '
          <b>-</b> SaleAccount will be created automatically after the sale is made. <br>
          <b>-</b> Send access token in header.'
        #swagger.parameters['body'] = {
        in: 'body',
        schema: {

        }
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
    const data = await SaleAccount.findByPk(req.params.id, {
      include: [
        {
          model: Sale,
          attributes: ["id"],
          include: [
            {
              model: Product,
              attributes: ["name"],
            },
          ],
        },
        { model: Firm, attributes: ["name"] },
      ]
    });
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
            FirmId:'number',
            paid:'number'
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

    const saleAccount = await SaleAccount.findByPk(req.params.id);
    if (!saleAccount) throw new Error('SaleAccount not found or already deleted.')
    saleAccount.updaterId = req.user.id;
    const isDeleted = await saleAccount.destroy({ force: hardDelete });

    res.status(isDeleted ? 202 : 404).send({
      error: !Boolean(isDeleted),
      message: !!isDeleted
        ? `The sale account id ${saleAccount.id} has been deleted.`
        : "Sale Account not found or something went wrong.",
      data: await req.getModelList(SaleAccount, {}, [
        {
          model: Sale,
          attributes: ["id"],
          include: [
            {
              model: Product,
              attributes: ["name"],
            },
          ],
        },
        { model: Firm, attributes: ["name"] },
      ]),
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
  multipleDelete: async (req, res) => {
    /* 
      #swagger.tags = ['Sale Account']
      #swagger.summary = 'Multiple-Delete  SaleAccount with ID'
      #swagger.description = `
        <b>-</b> Send access token in header. <br>
        <b>-</b> This function returns data includes remaning items.
      `
       #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>You must write the IDs of the SaleAccounts you want to delete into the array.</li>
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
      const saleAccount = await SaleAccount.findByPk(id);

      if (saleAccount) {
        saleAccount.updaterId = req.user.id;
        await saleAccount.destroy();
        totalDeleted++;
      }
    }

    res.status(totalDeleted ? 202 : 404).send({
      error: !Boolean(totalDeleted),
      message: !!totalDeleted
        ? `The sale Account id's ${ids} has been deleted.`
        : "Sale Account not found or something went wrong.",
      data: await req.getModelList(SaleAccount, {}, [
        {
          model: Sale,
          attributes: ["id"],
          include: [
            {
              model: Product,
              attributes: ["name"],
            },
          ],
        },
        { model: Firm, attributes: ["name"] },
      ]),
    });
  },
};
