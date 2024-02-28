"use strict";

const PurchaseAccount = require("../models/purchaseAccount");
const Material = require("../models/material");
const Purchase = require("../models/purchase");
const Firm = require("../models/firm");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Purchase']
        #swagger.summary = ' Purchase List'
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
    const data = await req.getModelList(Purchase, {}, [
      {
        model: Material,
        attributes: ["name"],
      },
      {
        model: Firm,
        attributes: ["name", "address", "phoneNo", "email"],
      },
    ]);

    res.status(200).send({
      details: await req.getModelListDetails(Purchase),
      data,
    });
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['Purchase']
        #swagger.summary = 'Purchase: Create'
        #swagger.description = '
          <b>-</b> To create an example from the Purchase table, you need the following information: MaterialId, quantity, FirmId and unitPrice. <br>
          <b>-</b> Send access token in header.'
        #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          MaterialId:'number',
          quantity:'number',
          unitPrice:'number',
          FirmId:'number'
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
    const data = await Purchase.findByPk(req.params.id, {
      include: [
        {
          model: Material,
          attributes: ["name",'unitType'],
        },
        {
          model: Firm,
          attributes: ["name", "address", "phoneNo", "email"],
        },
      ]
    });

    if (!data) {
      res.errorStatusCode = 404;
      throw new Error("Data Not found !");
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
              <li>You can update : MaterialId, quantity, FirmId and unitPrice .</li>
            </ul> ',
          required: true,
          schema: {
            MaterialId:'number',
            quantity:'number',
            unitPrice:'number',
            FirmId:'number'
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

    const purchase = await Purchase.findByPk(req.params.id);
    if (!purchase) throw new Error('Purchase not found or already deleted.')
    purchase.updaterId = req.user.id;
    const isDeleted = await purchase.destroy({ force: hardDelete });

    // return remaning data as wel
    const data = await req.getModelList(Purchase, {}, [
      {
        model: Material,
        attributes: ["name"],
      },
      {
        model: Firm,
        attributes: ["name", "address", "phoneNo", "email"],
      },
    ]);

    res.status(isDeleted ? 202 : 404).send({
      error: !Boolean(isDeleted),
      message: !!isDeleted
        ? `The purchase id ${purchase.id} has been deleted.`
        : "Purchase not found or something went wrong.",
      data,
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['Purchase']
        #swagger.summary = 'Restore deleted purchase with id'
        #swagger.description = `<b>-</b> Send access token in header.`
     */
    const purchase = await Purchase.findByPk(req.params.id, { paranoid: false, });
    if (!purchase) throw new Error("Purchase not Found.");
    purchase.updaterId = req.user.id;
    const isRestored = await purchase.restore();

    const material = await Material.findByPk(purchase.MaterialId);
    if (material) material.increment("quantity", { by: purchase.quantity });

    await PurchaseAccount.restore({ where: { PurchaseId: req.params.id } });

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Purchase restored successfuly."
        : "Purchase not found or something went wrong.",
    });
  },
  multipleDelete: async (req, res) => {
    /* 
      #swagger.tags = ['Purchase']
      #swagger.summary = 'Multiple-Delete  Purchase with ID'
      #swagger.description = `
        <b>-</b> Send access token in header. <br>
        <b>-</b> This function returns data includes remaning items.
      `
       #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>You must write the IDs of the purchases you want to delete into the array.</li>
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
      const purchase = await Purchase.findByPk(id);

      if (purchase) {
        purchase.updaterId = req.user.id;

        await purchase.destroy();
        totalDeleted++;
      }
    }

    // return remaning data as wel
    const data = await req.getModelList(Purchase, {}, [
      {
        model: Material,
        attributes: ["name"],
      },
      {
        model: Firm,
        attributes: ["name", "address", "phoneNo", "email"],
      },
    ]);

    res.status(totalDeleted ? 202 : 404).send({
      error: !Boolean(totalDeleted),
      message: !!totalDeleted
        ? `The purchase id's ${ids} has been deleted.`
        : "Purchase not found or something went wrong.",
      data,
    });
  },
};
