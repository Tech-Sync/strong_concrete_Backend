"use strict";
const router = require("express").Router();

const stock = require("../controllers/stock");
const { hasFirmAccess, isAdmin } = require("../middlewares/permissions");

router
  .route("/")
  .get(hasFirmAccess, stock.list)
  .post(hasFirmAccess, stock.create);
router
  .route("/:id")
  .get(hasFirmAccess, stock.read)
  .put(hasFirmAccess, stock.update)
  .delete(isAdmin, stock.delete);

router.route("/restore/:id").all(isAdmin, stock.restore);

module.exports = router;
