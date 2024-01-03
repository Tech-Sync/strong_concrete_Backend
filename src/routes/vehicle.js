"use strict"
const router =require("express").Router();

const vehicle =require("../controllers/vehicle")

router.get("/list", vehicle.list);
router.post("/create", vehicle.create);
router.get("/read", vehicle.read);
router.put("/update", vehicle.update);
router.delete("/delete", vehicle.delete);

module.exports = router;

