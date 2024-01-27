"use strict";
const router = require("express").Router();

const product = require("../controllers/product");
const permissions = require("../middlewares/permissions");
if (process.env.NODE_ENV !== 'development') {
  router.use(permissions.isLogin);
}

router
  .route("/")
  .get(permissions.CRU_AS,product.list)
  .post(permissions.CRU_AS,product.create);
router
  .route("/:id")
  .get(permissions.CRU_AS,product.read)
  .put(permissions.CRU_AS,product.update)
  .delete( permissions.isAdmin,product.delete);

router.route("/restore/:id").get( permissions.isAdmin, product.restore);
router.route("/multiple-delete").post(permissions.isAdmin, product.multipleDelete);

module.exports = router;
