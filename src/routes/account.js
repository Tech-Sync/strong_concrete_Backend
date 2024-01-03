"use strict";
const router = require("express").Router();

const account = require("../controllers/account");
const { hasFirmAccess, isAdmin } = require("../middlewares/permissions");

router
  .route("/")
  .get(hasFirmAccess, account.list)
  .post(hasFirmAccess, account.create);
router
  .route("/:id")
  .get(hasFirmAccess, account.read)
  .put(hasFirmAccess, account.update)
  .delete(isAdmin, account.delete);

router.route("/restore/:id").all(isAdmin, account.restore);

module.exports = router;
