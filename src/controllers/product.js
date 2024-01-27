"use strict";

const Product = require("../models/product");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Product']
        #swagger.summary = 'List All Products'
        #swagger.description = `<b>-</b> Only Admin can view all users.`
        #swagger.parameters['showDeleted'] = {
            in: 'query',
            type: 'boolean',
            description:'Includes deleted users as well, default value is false'
          }
    */
    const data = await Product.findAndCountAll();

    res.status(200).send(data);
  },

  create: async (req, res) => {
    /* 
        #swagger.tags = ['Product']
        #swagger.summary = 'Product: Create'
        #swagger.description = 'Create with name, price and materials'
        #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          "name": "c35",
          "price": 100,
          "materials": {
            "STONE": 1.9,
            "SAND": 1.9,
            "CEMENT": 270
          }
        }
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
        #swagger.summary = 'Read product with id'
        #swagger.description = `<b>-</b> Send access token in header.`
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
        #swagger.summary = 'Update product with id'
        #swagger.description = `<b>-</b> Send access token in header.`
        #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>Send the object includes attributes that should be updated.</li>
            </ul> ',
          required: true,
          schema: {
            price:'5'
          }
        } 
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
        #swagger.summary = 'Delete product with ID'
        #swagger.description = `<b>-</b> Send access token in header.`
    */
    const isDeleted = await Product.destroy({ where: { id: req.params.id } });

    res.status(isDeleted ? 204 : 404).send({
      error: !Boolean(isDeleted),
      message: "Product not found or something went wrong.",
    });
  },

  restore: async (req, res) => {
    /* 
        #swagger.tags = ['Product']
        #swagger.summary = 'Restore deleted product with ID'
        #swagger.description = `<b>-</b> Send access token in header.`
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
  multipleDelete: async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new Error('Invalid or empty IDs array in the request body.');
    }

    let totalDeleted = 0;

    for (const id of ids) {
        const product = await Product.findByPk(id);

        if (product) {
           
            product.updaterId = req.user.id;
            await product.destroy();
            totalDeleted++;
        }
    }

    res.status(totalDeleted ? 204 : 404).send({
        error: !Boolean(totalDeleted),
        message: "products not found or something went wrong."
    });
},
};
