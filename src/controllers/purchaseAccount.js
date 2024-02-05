"use strict";

const PurchaseAccount = require("../models/purchaseAccount");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['PurchaseAccount']
        #swagger.summary = ' PurchaseAccount List'
        #swagger.description = '
        <b>-</b> You can send query with endpoint for search[], sort[], page and limit. <br>
        
                <ul> Examples:
                    <li><b>SEARCHING: URL?search[PurchaseId]=3&search[FirmId]=2</b></li>
                    <li><b>SORTING: URL?sort[quantity]=desc&sort[totalPrice]=asc</b></li>
                    <li><b>PAGINATION: URL?page=1&limit=10&offset=10</b></li>
                    <li><b>DATE FILTER: URL?startDate=2023-07-13&endDate=2023-10-01  The date must be in year-month-day format</b></li>
                </ul>'

     */

    // const FirmId = req.query.firmId;

    // const balance = await PurchaseAccount.sum("balance", { where: { FirmId : FirmId} });

    // data.totalBalance = balance

    //! filtreleme ve include(iç içe denememiz lazım)
    // const data = await req.getModelList(PurchaseAccount, {}
    //   // İçteki include için filters
    // , [
    //   {
    //     model: Firm,
    //     include: [
    //       // İçteki içteki include
    //       {
    //         model: OtherModel,
    //         // Diğer seçenekler
    //       }
    //     ]
    //   },
    //   "Material"
    // ]);

    const data = await req.getModelList(PurchaseAccount);
    
    res.status(200).send({
      details: await req.getModelListDetails(PurchaseAccount),
      data,
    });
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['PurchaseAccount']
        #swagger.summary = 'PurchaseAccount Create'
        #swagger.description = '
          <b>-</b> PurchaseAccount will be created automatically when the purchase is made. <br>
          <b>-</b> There is no need to create a PurchaseAccount manually. <br>
          <b>-</b> Send access token in header.'
       
      
     */
    req.body.creatorId = req.user.id;

    if (!req.body.debit) req.body.balance = (0 - req.body.credit).toFixed(2);

    const data = await PurchaseAccount.create(req.body);


    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['PurchaseAccount']
        #swagger.summary = 'Read PurchaseAccount  with id'
        #swagger.description = '
       <b>-</b> Send access token in header. '
     */
    const data = await PurchaseAccount.findByPk(req.params.id);
    if (!data) {
      res.errorStatusCode = 404;
      throw new Error("Not found !");
    }

    res.status(200).send(data);
  },
  update: async (req, res) => {
    /* 
        #swagger.tags = ['PurchaseAccount']
        #swagger.summary = 'Update PurchaseAccount with id'
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
    const isUpdated = await PurchaseAccount.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await PurchaseAccount.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    /* 
        #swagger.tags = ['PurchaseAccount']
         #swagger.summary = 'Delete PurchaseAccount with id'
        #swagger.description = '<b>-</b> Send access token in header.'
     */
    const purchaseAccount = await PurchaseAccount.findByPk(req.params.id);
    purchaseAccount.updaterId = req.user.id;
    const isDeleted = await purchaseAccount.destroy();

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message:"PurchaseAccount not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['PurchaseAccount']
         #swagger.summary = 'Restore PurchaseAccount with id'
        #swagger.description = '<b>-</b> Send access token in header.'
     */
    const purchaseAccount = await PurchaseAccount.findByPk(req.params.id, { paranoid: false });
    if (!purchaseAccount) throw new Error("PurchaseAccount not Found.");
    purchaseAccount.updaterId = req.user.id;
    const isRestored = await purchaseAccount.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "PurchaseAccount restored successfuly."
        : "PurchaseAccount not found or something went wrong.",
    });
  },
  multipleDelete: async (req, res) => {
     /* 
      #swagger.tags = ['PurchaseAccount']
      #swagger.summary = 'Multiple-Delete  Firm with ID'
      #swagger.description = `<b>-</b> Send access token in header.`
       #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>You must write the IDs of the purchaseAccounts you want to delete into the array.</li>
            </ul> ',
          required: true,
          schema: {
            "ids": [1,2,3]
            
          }
        } 
    */
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new Error('Invalid or empty IDs array in the request body.');
    }

    let totalDeleted = 0;

    for (const id of ids) {
        const purchaseAccount = await PurchaseAccount.findByPk(id);

        if (purchaseAccount) {

            purchaseAccount.updaterId = req.user.id;
            await purchaseAccount.destroy();
            totalDeleted++;
        }
    }

    res.status(totalDeleted ? 204 : 404).send({
        error: !Boolean(totalDeleted),
        message: "purchaseAccounts not found or something went wrong."
    });
},
  
};
