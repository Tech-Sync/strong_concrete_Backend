const router = require("express").Router();

// User
router.use('/users', require('./user'))
// Auth
router.use('/auth', require('./auth'))
// Firm
router.use('/firms', require('./firm'))
// Material
router.use('/materials', require('./material'))
// Purchase
router.use('/purchases', require('./purchase'))

// Account
router.use('/accounts', require('./account'))


module.exports = router
