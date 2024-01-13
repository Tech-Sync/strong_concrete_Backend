"use strict";

const Production = require("../models/production");
const Delivery = require("../models/delivery");
const Sale = require("../models/sale");
const Product = require("../models/product");
const Material = require("../models/material");
const Vehicle = require("../models/vehicle");

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

    req.body.status = req.body?.status?.toUpperCase();
    let isUpdated;

    if (req.body?.status) {
      // status update and controller for decrement quantity of material
      if (req.body?.status === "BEING PRODUCED") {
        const production = await Production.findOne({
          where: { id: req.params.id },
          include: [
            {
              model: Sale,
              attributes: ["quantity"],
              include: [
                {
                  model: Product,
                  attributes: ["materials", "name"],
                },
              ],
            },
          ],
        });

        if (!production)
          throw new Error("Production is not found! Check the materials.");

        const statusesArr = [4, 5, 6];

        if (statusesArr.includes(production.status))
          throw new Error("You can not chnage status backward!");

        const productMaterial = production?.Sale?.Product?.materials;
        const productName = production?.Sale?.Product?.name;
        const materialKey = Object.keys(productMaterial);

        if (production.status !== 2) {
          for (const key of materialKey) {
            let material = await Material.findOne({ where: { name: key } });

            if (material.quantity < productMaterial[key]) {
              throw new Error(
                `Insufficient ${key} for ${productName} concrete.`
              );
            }

            await material.decrement("quantity", { by: productMaterial[key] });
          }
        }

        isUpdated = await Production.update(req.body, {
          where: { id: req.params.id },
          individualHooks: true,
        });
      } else if (req.body?.status === "PRODUCED") {

        const productionData = await Production.findByPk(req.params.id, {
          include: { model: Sale, attributes: ["quantity"] },
        });

        if(productionData.status !== 2 || productionData.status !== 3 ){
          throw new Error(
            "You can not update status 2 steps at once!"
          );
        }

        if (!productionData.VehicleIds && !req.body.VehicleIds) {
          throw new Error(
            "Please select the whicles before updating status to produced."
          );
        }

        let totalCapacity = 0;

        const VehicleIds = productionData.VehicleIds
          ? productionData.VehicleIds
          : req.body.VehicleIds;

        for (const vehicleId of VehicleIds) {
          const vehicleData = await Vehicle.findByPk(vehicleId);

          if (!vehicleData)
            throw new Error(
              `Vehicle ID ${vehicleId} is not found. Update your vehicles.`
            );

          totalCapacity += vehicleData?.capacity;
        }

        if (productionData?.Sale?.quantity > totalCapacity) {
          productionData.status = "VEHICLE WAITING";
          await productionData.save();

          throw new Error(
            "Capacity of vehicle is not enough! Update your vehicles."
          );
        }

        isUpdated = await Production.update(req.body, {
          where: { id: req.params.id },
          individualHooks: true,
        });

        for (const vehicle of VehicleIds) {
          await Vehicle.update(
            { status: "LOADING" },
            {
              where: { id: vehicle },
              individualHooks: true,
            }
          );

          await Delivery.create({
            ProductionId: req.params.id,
            VehicleId: vehicle,
            creatorId: req.user.id,
          });
        }
      }
    } else {
      isUpdated = await Production.update(req.body, {
        where: { id: req.params.id },
        individualHooks: true,
      });
    }

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
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
