"use strict";
const Production = require("../models/production");
const Delivery = require("../models/delivery");
const Sale = require("../models/sale");
const Product = require("../models/product");
const Material = require("../models/material");
const Vehicle = require("../models/vehicle");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Production']
    */
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
    /* 
        #swagger.tags = ['Production']
    */
    req.body.creatorId = req.user.id;
    const data = await Production.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Production']
    */
    const data = await Production.findOne({
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
    if (!data) throw new Error("Production not found !");

    res.status(200).send(data);
  },
  update: async (req, res) => {
    /* 
        #swagger.tags = ['Production']
    */
    req.body.updaterId = req.user.id;

    let isUpdated;

    if (req.body?.status) {
      // status update and controller for decrement quantity of material
      if (req.body?.status === 2) {
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

        if (!production) throw new Error("Production is not found!");

        //--------vehicle controls start---------
        if (!production.VehicleIds && !req.body.VehicleIds) {
          throw new Error(
            "Please select the whicles before updating status to being produced."
          );
        }

        let totalCapacity = 0;

        const VehicleIds = production.VehicleIds
          ? production.VehicleIds
          : req.body.VehicleIds;

        // check is vehicle available and get total capacity of vehicles.
        for (const vehicleId of VehicleIds) {
          const vehicleData = await Vehicle.findByPk(vehicleId);

          if (!vehicleData)
            throw new Error(
              `Vehicle ID ${vehicleId} is not found. Update your vehicles.`
            );

          totalCapacity += vehicleData?.capacity;
        }

        // update production status 'WAITING VEHICLE'
        if (production?.Sale?.quantity > totalCapacity) {
          production.status = 3;
          await production.save();

          throw new Error(
            "Capacity of vehicles is not enough! Update your vehicles."
          );
        }

        //------vehicle controls ends----------

        if ([4, 5].includes(production.status))
          throw new Error("You can not chnage status backward!");

        const quantity = production?.Sale?.quantity;
        const productMaterial = production?.Sale?.Product?.materials;
        const productName = production?.Sale?.Product?.name;
        const materialKey = Object.keys(productMaterial);

        if (production.status !== 2) {
          let count = 0;
          // checking material quantity
          for (const key of materialKey) {
            let material = await Material.findOne({ where: { name: key } });
            if (
              material.quantity < (productMaterial[key] * quantity).toFixed(2)
            ) {
              production.status = 6;
              await production.save();

              throw new Error(
                `Insufficient ${key} for ${productName} concrete.`
              );
            }
            count += 1;
          }
          // decrement material quantity
          if (count === materialKey.length) {
            for (const key of materialKey) {
              let material = await Material.findOne({ where: { name: key } });
              const by = (productMaterial[key] * quantity).toFixed(2);
              await material.decrement("quantity", { by });
            }
            // create delivery and update vehicles status
            for (const vehicle of VehicleIds) {
              await Vehicle.update(
                { status: 2 },
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
        }
      } else if (req.body?.status === 4) {
        const productionData = await Production.findByPk(req.params.id);

        if (![2, 3].includes(productionData.status)) {
          throw new Error("You can not update status 2 steps at once!");
        }
      } else if ([5, 7].includes(req.body?.status)) {
        throw new Error(
          "Production can not be cancelled from here, talk to saler or admin."
        );
      }

      isUpdated = await Production.update(req.body, {
        where: { id: req.params.id },
        individualHooks: true,
      });
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
    /* 
        #swagger.tags = ['Production']
    */
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
    /* 
        #swagger.tags = ['Production']
    */
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
