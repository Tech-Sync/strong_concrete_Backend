"use strict";
const router = require("express").Router();

const purchaseAccount = require("../controllers/purchaseAccount");
const permissions = require("../middlewares/permissions");
if (process.env.NODE_ENV !== 'development') {
  router.use(permissions.isLogin);
}

router.route("/")
  .get(permissions.R_ASA, purchaseAccount.list)
  .post(permissions.CU_AA, purchaseAccount.create);
router
  .route("/:id")
  .get(permissions.R_ASA, purchaseAccount.read)
  .put(permissions.CU_AA, purchaseAccount.update)
  .delete(permissions.isAdmin, purchaseAccount.delete);

router.route("/restore/:id").get(permissions.isAdmin, purchaseAccount.restore);
router.route("/multiple-delete").post(permissions.isAdmin, purchaseAccount.multipleDelete);

module.exports = router;
