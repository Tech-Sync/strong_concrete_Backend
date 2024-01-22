"use strict";
const router = require("express").Router();

const saleAccount = require("../controllers/saleAccount");
const permissions = require("../middlewares/permissions");
if (process.env.NODE_ENV !== 'development') {
  router.use(permissions.isLogin);
}

router
  .route("/")
  .get(permissions.CRU_AS, saleAccount.list)
  .post(permissions.CRU_AS, saleAccount.create);
router
  .route("/:id")
  .get(permissions.CRU_AS, saleAccount.read)
  .put(permissions.CRU_AS, saleAccount.update)
  .delete(permissions.isAdmin, saleAccount.delete);

router.route("/restore/:id").get(permissions.isAdmin, saleAccount.restore);
router.route("/multipleDelete").post(permissions.isAdmin, saleAccount.multipleDelete)

module.exports = router;
