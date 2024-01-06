const router = require("express").Router();

// User
router.use('/users', require('./user'))
// Auth
router.use('/auth', require('./auth'))
// Firm
router.use('/firms', require('./firm'))
// Product
router.use('/products', require('./product'))
// Material
router.use('/materials', require('./material'))
// Purchase
router.use('/purchases', require('./purchase'))
// Account
router.use('/accounts', require('./account'))
// Vehicle
router.use('/vehicles', require('./vehicle'))


module.exports = router
