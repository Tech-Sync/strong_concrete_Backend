"use strict";
const router = require("express").Router();

const purchase = require("../controllers/purchase");
const permissions = require("../middlewares/permissions");
if (process.env.NODE_ENV !== 'development') {
  router.use(permissions.isLogin);
}

router
  .route("/")
  .get(permissions.R_ASA, purchase.list)
  .post(permissions.CU_AA, purchase.create);
router
  .route("/:id")
  .get(permissions.R_ASA, purchase.read)
  .put(permissions.CU_AA,purchase.update)
  .delete(permissions.isAdmin, purchase.delete);

router.route("/restore/:id").get(permissions.isAdmin, purchase.restore);
router.route("/multipleDelete").post(permissions.isAdmin, purchase.multipleDelete)

module.exports = router;
