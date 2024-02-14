"use strict";

const Sale = require("../models/sale");
const Production = require("../models/production");
const SaleAccount = require("../models/saleAccount");
const Delivery = require("../models/delivery");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Sale']
        #swagger.summary = ' Sale List'
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
    const data = await req.getModelList(Sale);

    res.status(200).send({
      details: await req.getModelListDetails(Sale),
      data,
    });
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['Sale']
         #swagger.summary = 'Sale Create'
        #swagger.description = '
          <b>-</b>To create Sales, use FirmId,ProductId,quantity,location,requestedDate, sideContact are required  <br>
          <b>-</b> Send access token in header.'
        #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          FirmId:'1',
          ProductId:'50',
          quantity:'11111',
          location:'Konya',
          requestedDate:"2024-07-01",
          sideContact:"05659898"
        }
      }
    */
    req.body.creatorId = req.user.id;

    const data = await Sale.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Sale']
    #swagger.summary = 'Read sale with id'
        #swagger.description = '
       <b>-</b> Send access token in header. '
        */
    const data = await Sale.findByPk(req.params.id);
    if (!data) {
      res.errorStatusCode = 404;
      throw new Error("Not found !");
    }

    res.status(200).send(data);
  },
  update: async (req, res) => {
    /* 
        #swagger.tags = ['Sale']
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
    const user = req.user;
    let msg;

    const sale = await Sale.findByPk(req.params.id);

    if (req.body.status || req.body.confirmDate) {
      // Checking for auth
      if (user.role !== 5) {
        throw new Error(
          "You are not athorized to change Status or Confirm-Date !"
        );
      }

      // check confirm date when status changing
      if (req.body.status === 2) {
        if (!(req.body.confirmDate || sale.confirmDate)) {
          throw new Error("Confirm Date is missing ");
        }
      }

      // check if confirm date is past
      if (new Date() > new Date(req.body.confirmDate)) {
        throw new Error("Confirm date can not be past !");
      }

      const isUpdated = await Sale.update(req.body, {
        where: { id: req.params.id },
        individualHooks: true,
      });

      // check conditions for creating production
      try {
        if (isUpdated[0] && req.body?.status === 2) {
          const isExist = await Production.findOne({
            where: { SaleId: req.params.id },
          });

          if (!isExist) {
            const productionData = {
              SaleId: req.params.id,
              creatorId: req.user.id,
            };

            await Production.create(productionData);
            let msg = "Production has been created !";
          }
          const isExistAccount = await SaleAccount.findOne({
            where: { SaleId: req.params.id },
          });

          if (!isExistAccount) {
            const saleAccData = {
              SaleId: req.params.id,
              creatorId: req.user.id,
            };

            const saleAcc = await SaleAccount.create(saleAccData);
            if (!saleAcc)
              msg = "Sale Account not created, Please do it manuel.";
          }
        } else if (isUpdated[0] && req.body?.status === 4) {
          const production = await Production.findOne({
            where: { SaleId: req.params.id },
          });
          if (production) {
            if (production.status === 2 || production.status === 4) {
              production.status = 7;
              await production.save();
            } else {
              production.status = 6;
              await production.save();
            }
          }

          const delivery = await Delivery.findOne({
            where: { ProductionId: production.id },
          });
          if (delivery) {
            delivery.status = 5;
            await delivery.save();
          }

          const SaleAccount = await SaleAccount.findOne({
            where: { SaleId: req.params.id },
          });
          if (SaleAccount) {
            await SaleAccount.destroy();
          }
        }
      } catch (error) {
        msg = "Production not created, Please do it manuel.";
      } finally {
        res.status(202).send({
          isUpdated: Boolean(isUpdated[0]),
          data: await Sale.findByPk(req.params.id),
          msg,
        });
      }
    } else {
      const isUpdated = await Sale.update(req.body, {
        where: { id: req.params.id },
        individualHooks: true,
      });

      res.status(202).send({
        isUpdated: Boolean(isUpdated[0]),
        data: await Sale.findByPk(req.params.id),
        msg,
      });
    }
  },

  delete: async (req, res) => {
    /* 
        #swagger.tags = ['Sale']
        #swagger.summary = 'Delete sale with id'
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
    if(req.user.role !== 5 && hardDelete ) throw new Error('You are not authorized for permanent deletetion!')

    const sale = await Sale.findByPk(req.params.id);
    if(!sale) throw new Error('Sale not found or already deleted.')
    sale.updaterId = req.user.id;
    const isDeleted = await sale.destroy({ force: hardDelete });

    res.status(isDeleted ? 202 : 404).send({
      error: !Boolean(isDeleted),
      message: !!isDeleted
        ? `The sasle id ${sale.id} has been deleted.`
        : "Sale not found or something went wrong.",
      data: await req.getModelList(Sale),
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['Sale']
         #swagger.summary = 'Restore deleted sale with id'
        #swagger.description = `<b>-</b> Send access token in header.`
    */
    const sale = await Sale.findByPk(req.params.id, { paranoid: false });
    if (!sale) throw new Error("Sale not Found.");
    sale.updaterId = req.user.id;
    const isRestored = await sale.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Sale restored successfuly."
        : "Sale not found or something went wrong.",
    });
  },
  multipleDelete: async (req, res) => {
    /* 
      #swagger.tags = ['Sale']
      #swagger.summary = 'Multiple-Delete  Sale with ID'
      #swagger.description = `
        <b>-</b> Send access token in header. <br>
        <b>-</b> This function returns data includes remaning items.
      `
       #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>You must write the IDs of the sales you want to delete into the array.</li>
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
      const sale = await Sale.findByPk(id);

      if (sale) {
        sale.updaterId = req.user.id;
        await sale.destroy();
        totalDeleted++;
      }
    }

    res.status(totalDeleted ? 202 : 404).send({
      error: !Boolean(totalDeleted),
      message: !!totalDeleted
        ? `The sale id's ${ids} has been deleted.`
        : "Sale not found or something went wrong.",
      data: await req.getModelList(Sale),
    });
  },
};
