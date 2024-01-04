"use strict";
const router = require("express").Router();

const purchase = require("../controllers/purchase");

router
  .route("/")
  .get(purchase.list)
  .post(purchase.create);
router
  .route("/:id")
  .get(purchase.read)
  .put(purchase.update)
  .delete( purchase.delete);

router.route("/restore/:id").all( purchase.restore);

module.exports = router;
