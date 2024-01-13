"use strict";
const router = require("express").Router();

const saleAccount = require("../controllers/saleAccount");

router.route("/").get(saleAccount.list).post(saleAccount.create);
router
  .route("/:id")
  .get(saleAccount.read)
  .put(saleAccount.update)
  .delete(saleAccount.delete);

router.route("/restore/:id").all(saleAccount.restore);

module.exports = router;
