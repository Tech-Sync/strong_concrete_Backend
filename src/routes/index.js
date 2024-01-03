const router = require("express").Router();

// User
router.use('/users', require('./user'))
// Auth
router.use('/auth', require('./auth'))
// Firm
router.use('/firms', require('./firm'))
// Vehicle
router.use('/vehicles', require('./vehicle'))


module.exports = router
