"use strict";

const Production = require("../models/production");
const Delivery = require("../models/delivery");
const Sale = require("../models/sale");
const Product = require("../models/product");

module.exports = {
  list: async (req, res) => {
    const data = await Production.findAndCountAll({
      include: [
        {
          model: Sale,
          attributes: ["id", "quantity", "FirmId", "confirmDate"],
          include: [
            {
              model: Product,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    res.status(200).send(data);
  },

  create: async (req, res) => {
    req.body.creatorId = req.user.id;
    const data = await Production.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    const data = await Production.findByPk(req.params.id);
    if (!data) throw new Error("Production not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    req.body.updaterId = req.user.id;

    const queries = Object.keys(req.body).filter(
      (key) => key !== "status" && key !== "updaterId"
    );

    if (req.user.role !== "ADMIN" && queries.length > 0)
      throw new Error(
        "You are not Authorized to update except status and updaterId !"
      );

    if (req.body.status) req.body.status = req.body.status.toUpperCase();

    const isUpdated = await Production.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    if (isUpdated[0] && req.body?.status === "COMPLETED") {
      const deliveryData = {
        ProductionId: req.params.id,
        creatorId: req.user.id,
      };

      await Delivery.create(deliveryData);
    }

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await Production.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    const production = await Production.findByPk(req.params.id);
    production.updaterId = req.user.id;
    const isDeleted = await production.destroy();

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "Production deleted successfuly."
        : "Production not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    const production = await Production.findByPk(req.params.id, {
      paranoid: false,
    });
    if (!production) throw new Error("Production not Found.");
    production.updaterId = req.user.id;
    const isRestored = await production.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Production restored successfuly."
        : "Production not found or something went wrong.",
    });
  },
};
