"use strict";

const Sale = require("../models/sale");
const Production = require("../models/production");
const Vehicle = require("../models/vehicle");

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

    if (user.role !== "ADMIN" && (req.body.status || req.body.confirmDate)) {
      throw new Error(
        "You are not athorized to change Status or Confirm-Date !"
      );
    }

    if(!(req.body.status && req.body.confirmDate)) throw new Error("Confirm Date or Status is missing ")

    if (req.body.status) {
      req.body.status = req.body.status.toUpperCase();
    }

    const isUpdated = await Sale.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    let msg;

    try {
      if (isUpdated[0] && req.body?.status === "APPROVED") {
        const vehicles = await Vehicle.findAll({
          where: { isPublic: true, status: 1 },
        });

        const productionData = {
          SaleId: req.params.id,
          VehicleId: vehicles ? vehicles[0].id : null,
          creatorId: req.user.id,
        };

        const isExist = await Production.findOne({
          where: { SaleId: req.params.id },
        });

        if (!isExist) {
          await Production.create(productionData);
          let msg = "Production has been created !";
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
