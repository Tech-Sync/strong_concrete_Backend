"use strict";
const router = require("express").Router();

const product = require("../controllers/product");

router
  .route("/")
  .get(product.list)
  .post(product.create);
router
  .route("/:id")
  .get(product.read)
  .put(product.update)
  .delete( product.delete);

router.route("/restore/:id").all( product.restore);

module.exports = router;
