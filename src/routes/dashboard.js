"use strict";
const router = require("express").Router();

const dashboard = require("../controllers/dashboard");
const permissions = require("../middlewares/permissions");

if (process.env.NODE_ENV !== 'development') {
    router.use(permissions.isLogin);
}

router.route("/").get(dashboard.list)


module.exports = router;
