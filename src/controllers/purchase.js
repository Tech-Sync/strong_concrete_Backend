"use strict";

const PurchaseAccount = require("../models/purchaseAccount");
const Material = require("../models/material");
const Purchase = require("../models/purchase");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Purchase']
        #swagger.summary = ' Purchase List'
        #swagger.description = '
        <b>-</b> You can send query with endpoint for search[], sort[], page and limit. <br>
        
                <ul> Examples:
                    <li><b>SEARCHING: URL?search[MaterialId]=3&search[FirmId]=2</b></li>
                    <li><b>SORTING: URL?sort[quantity]=desc&sort[totalPrice]=asc</b></li>
                    <li><b>PAGINATION: URL?page=1&limit=10&offset=10</b></li>
                    <li><b>DATE FILTER: URL?startDate=2023-07-13&endDate=2023-10-01  The date must be in year-month-day format</b></li>
                </ul>'
        
    */
    const data = await req.getModelList(Purchase);

    res.status(200).send({
      details: await req.getModelListDetails(Purchase),
      data,
    });
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['Purchase']
        #swagger.summary = 'Purchase Create'
        #swagger.description = '
          <b>-</b> MaterialId,quantity,FirmId,unitPrice is required to purchase materials <br>
          <b>-</b> Send access token in header.'
        #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          MaterialId:'1',
          quantity:'50',
          unitPrice:'11111',
          FirmId:'2'
        }
      }
    
    */
    req.body.creatorId = req.user.id;
    const data = await Purchase.create(req.body);

    const accountData = {
      PurchaseId: data.id,
      debit: data.totalPrice,
      balance: data.totalPrice,
      FirmId: data.FirmId,
      creatorId: data.creatorId,
      updaterId: null,
    };
    const purchaseAccount = await PurchaseAccount.create(accountData);

    let msg;
    try {
      if (!purchaseAccount)
        throw new Error("PurchaseAccount table not created for some reason.");
    } catch (error) {
      msg = error.message;
    } finally {
      res.status(200).send({ data, msg });
    }
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Purchase']
        #swagger.summary = 'Read purchase with id'
        #swagger.description = '
       <b>-</b> Send access token in header. '
    */
    const data = await Purchase.findByPk(req.params.id);
    if (!data) {
      res.errorStatusCode = 404;
      throw new Error("Not found !");
    }

    res.status(200).send(data);
  },
  update: async (req, res) => {
    /* 
        #swagger.tags = ['Purchase']
        #swagger.summary = 'Update purchase with id'
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

    const isUpdated = await Purchase.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    const updatedPurchase = await Purchase.findByPk(req.params.id);
    const oldAccount = await PurchaseAccount.findOne({
      where: { PurchaseId: req.params.id },
    });

    const purchaseAccount = await PurchaseAccount.update(
      {
        debit: updatedPurchase.totalPrice,
        FirmId: updatedPurchase.FirmId,
        balance: updatedPurchase.totalPrice - oldAccount.credit,
      },
      { where: { PurchaseId: req.params.id } }
    );

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: updatedPurchase,
    });
  },

  delete: async (req, res) => {
    /* 
        #swagger.tags = ['Purchase']
        #swagger.summary = 'Delete purchase with id'
        #swagger.description = '<b>-</b> Send access token in header.'
    */
    const purchase = await Purchase.findByPk(req.params.id);
    purchase.updaterId = req.user.id;
    const isDeleted = await purchase.destroy();

    await PurchaseAccount.destroy({ where: { PurchaseId: req.params.id } });

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: "Purchase not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['Purchase']
        #swagger.summary = 'Restore deleted purchase with id'
        #swagger.description = `<b>-</b> Send access token in header.`
     */
    const purchase = await Purchase.findByPk(req.params.id, {
      paranoid: false,
    });
    if (!purchase) throw new Error("Purchase not Found.");
    purchase.updaterId = req.user.id;
    const isRestored = await purchase.restore();

    const material = await Material.findByPk(purchase.MaterialId);
    material.increment("quantity", { by: purchase.quantity });

    await PurchaseAccount.restore({ where: { PurchaseId: req.params.id } });

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Purchase restored successfuly."
        : "Purchase not found or something went wrong.",
    });
  },
  multipleDelete: async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error("Invalid or empty IDs array in the request body.");
    }

    let totalDeleted = 0;

    for (const id of ids) {
      const purchase = await Purchase.findByPk(id);

      if (purchase) {
        purchase.updaterId = req.user.id;
        await purchase.destroy();
        totalDeleted++;
      }
    }

    res.status(totalDeleted ? 204 : 404).send({
      error: !Boolean(totalDeleted),
      message: "purchases not found or something went wrong.",
    });
  },
};
