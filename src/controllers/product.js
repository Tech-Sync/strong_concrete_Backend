"use strict";

const Product = require("../models/product");

module.exports = {
  list: async (req, res) => {
    /* 
        #swagger.tags = ['Product']
        #swagger.summary = 'List All Products'
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
    const data = await req.getModelList(Product);

    res.status(200).send({
      details: await req.getModelListDetails(Product),
      data,
    });
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
          name:'C35',
          price: 100,
            materials: {
              STONE : 1.9,
              SAND: 1.9,
              CEMENT: 270
            }
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

    const product = await Product.findByPk(req.params.id);
    if(!product) throw new Error('Product not found or already deleted.')
    product.updaterId = req.user.id;
    const isDeleted = await product.destroy({ force: hardDelete });

    res.status(isDeleted ? 202 : 404).send({
      error: !Boolean(isDeleted),
      message: !!isDeleted
        ? `The product named ${product.name} has been deleted.`
        : "Product not found or something went wrong.",
      data: await req.getModelList(Product),
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
    /* 
      #swagger.tags = ['Product']
      #swagger.summary = 'Multiple-Delete  Product with ID'
      #swagger.description = `
        <b>-</b> Send access token in header. <br>
        <b>-</b> This function returns data includes remaning items.
      `
       #swagger.parameters['body'] = {
          in: 'body',
          description: '
            <ul> 
              <li>You must write the IDs of the products you want to delete into the array.</li>
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
      const product = await Product.findByPk(id);

      if (product) {
        product.updaterId = req.user.id;
        await product.destroy();
        totalDeleted++;
      }
    }

    res.status(totalDeleted ? 202 : 404).send({
      error: !Boolean(totalDeleted),
      message: !!totalDeleted
        ? `The product id's ${ids} has been deleted.`
        : "Product not found or something went wrong.",
      data: await req.getModelList(Product),
    });
  },
};
