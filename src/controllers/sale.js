"use strict";

const Sale = require("../models/sale");
const Production = require("../models/production");
const SaleAccount = require("../models/saleAccount");
const Delivery = require("../models/delivery");

module.exports = {
  list: async (req, res) => {
    const data = await Sale.findAndCountAll();

    res.status(200).send(data);
  },

  create: async (req, res) => {
    req.body.creatorId = req.user.id;

    const data = await Sale.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    const data = await Sale.findByPk(req.params.id);
    if (!data) throw new Error("Sale not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
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
            if (!saleAcc) msg = "Sale Account not created, Please do it manuel.";
          }
        }else if(isUpdated[0] && req.body?.status === 4){

          const production = await Production.findOne({where:{SaleId: req.params.id}})
          if(production){
            if(production.status === 2 || production.status === 4){
              production.status = 7
              await production.save()
            }else{
              production.status = 6
              await production.save()
            }
          }

          const delivery = await Delivery.findOne({where:{ProductionId: production.id}})
          if(delivery){
            delivery.status = 5
            await delivery.save()
          }

          const SaleAccount = await SaleAccount.findOne({where:{SaleId: req.params.id}})
          if(SaleAccount){
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
    const sale = await Sale.findByPk(req.params.id);
    sale.updaterId = req.user.id;
    const isDeleted = await sale.destroy();

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "Sale deleted successfuly."
        : "Sale not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
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
};
