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
// PurchaseAccount
router.use('/purchase_accounts', require('./account'))
// SaleAccount
router.use('/sale_accounts', require('./saleAccount'))
// Vehicle
router.use('/vehicles', require('./vehicle'))
// Sale
router.use('/sales', require('./sale'))
// Production
router.use('/productions', require('./production'))
// Delivery
router.use('/deliveries', require('./delivery'))


module.exports = router
