const router = require("express").Router();

// User
router.use('/users', require('./user'))

module.exports = router
