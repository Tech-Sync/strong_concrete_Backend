"use strict";
const router = require("express").Router();

const production = require("../controllers/production");
const permissions = require("../middlewares/permissions");
if (process.env.NODE_ENV !== 'development') {
  router.use(permissions.isLogin);
}

router
  .route("/")
  .get(permissions.CRU_ASP, production.list)
  .post(permissions.CRU_ASP, production.create);
router
  .route("/:id")
  .get(permissions.CRU_ASP, production.read)
  .put(permissions.CRU_ASP, production.update)
  .delete(permissions.isAdmin, production.delete);

router.route("/restore/:id").get(permissions.isAdmin, production.restore);
router.route("/multiple-delete").post(permissions.isAdmin, production.multipleDelete);

module.exports = router;
