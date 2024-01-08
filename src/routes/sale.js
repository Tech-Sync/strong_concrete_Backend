"use strict";
const router = require("express").Router();

const sale = require("../controllers/sale");

router
  .route("/")
  .get(sale.list)
  .post(sale.create);
router
  .route("/:id")
  .get(sale.read)
  .put(sale.update)
  .delete( sale.delete);

router.route("/restore/:id").all( sale.restore);

module.exports = router;
