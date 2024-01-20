"use strict";
const router = require("express").Router();

const account = require("../controllers/account");
const permissions = require("../middlewares/permissions");
router.use(permissions.isLogin);

router.route("/")
  .get(permissions.R_ASA, account.list)
  .post(permissions.CU_AA, account.create);
router
  .route("/:id")
  .get(permissions.R_ASA, account.read)
  .put(permissions.CU_AA, account.update)
  .delete(permissions.isAdmin, account.delete);

router.route("/restore/:id").get(permissions.isAdmin, account.restore);

module.exports = router;
