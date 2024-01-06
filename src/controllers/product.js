"use strict";

const Product  = require("../models/product");

module.exports = {
  list: async (req, res) => {
    const data = await Product.findAndCountAll();

    res.status(200).send(data);
  },

  
   create: async (req, res) => {
  try {
    const { materials } = req.body;

    // Gerekli anahtarların (STONE, SAND, CEMENT) obje içinde olup olmadığını kontrol et
    const requiredKeys = ['STONE', 'SAND', 'CEMENT'];
    const hasRequiredKeys = requiredKeys.every(key => materials.hasOwnProperty(key));

    if (!hasRequiredKeys) {
      return res.status(400).send({ error: 'Missing or invalid keys in material information!' });
    }

    // Diğer kontrolleri buraya ekleyebilirsiniz.

    // Geçerli veri ise creatorId ekleyip kaydet
    req.body.creatorId = req.user.id;
    const data = await Product.create(req.body);

    res.status(200).send(data);
  } catch (error) {
    console.error('An error occurred while creating the product:', error);
    res.status(500).send({ error: 'An error occurred, please try again!' });
  }
},

  

  read: async (req, res) => {
    const data = await Product.findByPk(req.params.id);
    if (!data) throw new Error("Product not found!");

    res.status(200).send(data);
  },

  update: async (req, res) => {
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
    const isDeleted = await Product.destroy({ where: { id: req.params.id } });

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: isDeleted
        ? "Product deleted succesfully"
        : "Product not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
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
