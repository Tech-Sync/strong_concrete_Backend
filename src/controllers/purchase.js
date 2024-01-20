
"use strict";

const Account = require("../models/account");
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
    const data = await Purchase.findAndCountAll();

    res.status(200).send(data);
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
    const account = await Account.create(accountData);

    if (!account) throw new Error("Account table not created for some reason.");

    res.status(200).send(data);
  },

  read: async (req, res) => {
     /* 
        #swagger.tags = ['Purchase']
        #swagger.summary = 'Read purchase with id'
        #swagger.description = '
       <b>-</b> Send access token in header. '
    */
    const data = await Purchase.findByPk(req.params.id);
    if (!data) throw new Error("Purchase not found !");

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
    const oldAccount = await Account.findOne({
      where: { PurchaseId: req.params.id },
    });

    const account = await Account.update(
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

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "Purchase deleted successfuly."
        : "Purchase not found or something went wrong.",
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

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Purchase restored successfuly."
        : "Purchase not found or something went wrong.",
    });
  },
};
