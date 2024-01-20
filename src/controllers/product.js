"use strict";

const Product = require("../models/product");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Product']
    */
    const data = await Product.findAndCountAll();

    res.status(200).send(data);
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['Product']
    */
    const { materials } = req.body;

    // Gerekli anahtarların (STONE, SAND, CEMENT) obje içinde olup olmadığını kontrol et
    const requiredKeys = ["STONE", "SAND", "CEMENT"];
    const hasRequiredKeys = requiredKeys.every((key) =>
      materials.hasOwnProperty(key)
    );

    if (!hasRequiredKeys)
      throw new Error("Missing or invalid keys in material information!");

    req.body.creatorId = req.user.id;
    req.body.name = req.body.name.toUpperCase();

    const isExist = await Product.findOne({ where: { name: req.body.name } });
    if (isExist)
      throw new Error("The product is available with this name already !");

    const data = await Product.create(req.body);

    res.status(200).send(data);
  },

  read: async (req, res) => {
    /* 
        #swagger.tags = ['Product']
    */
    const data = await Product.findByPk(req.params.id);
    if (!data) {
      res.errorStatusCode = 404;
      throw new Error("Not found !");
    }

    res.status(200).send(data);
  },

  update: async (req, res) => {
    /* 
        #swagger.tags = ['Product']
    */
    req.body.updaterId = req.user.id;
    const isUpdated = await Product.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    res.status(202).send({
      isUpdated: Boolean(isUpdated[0]),
      data: await Product.findByPk(req.params.id),
    });
  },

  delete: async (req, res) => {
    /* 
        #swagger.tags = ['Product']
    */
    const isDeleted = await Product.destroy({ where: { id: req.params.id } });

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "Product deleted succesfully"
        : "Product not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['Product']
    */
    const product = await Product.findByPk(req.params.id, { paranoid: false });
    if (!product) throw new Error("Product not Found.");
    product.updaterId = req.user.id;
    const isRestored = await product.restore();

    res.status(200).send({
      error: !Boolean(isRestored),
      message: isRestored
        ? "Product restored successfuly."
        : "Product not found or something went wrong.",
    });
  },
};
