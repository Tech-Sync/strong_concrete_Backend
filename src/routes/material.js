"use strict";
const router = require("express").Router();

const material = require("../controllers/material");
const permissions = require("../middlewares/permissions");
if (process.env.NODE_ENV !== 'development') {
  router.use(permissions.isLogin);
}

router.route("/")
  .get(permissions.R_ASA, material.list)
  .post(permissions.CU_AA, material.create);
router
  .route("/:id")
  .get(permissions.R_ASA, material.read)
  .put(permissions.CU_AA, material.update)
  .delete(permissions.isAdmin, material.delete);

router.route("/restore/:id").get(permissions.isAdmin, material.restore);
router.route("/multipleDelete").post(permissions.isAdmin, material.multipleDelete)

module.exports = router;
