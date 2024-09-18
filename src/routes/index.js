const router = require("express").Router();

// Auth
router.use('/auth', require('./auth'))
// User
router.use('/users', require('./user'))
// Firm
router.use('/firms', require('./firm'))
// Product
router.use('/products', require('./product'))
// Material
router.use('/materials', require('./material'))
// Purchase
router.use('/purchases', require('./purchase'))
// PurchaseAccount
router.use('/purchase_accounts', require('./purchaseAccount'))
// Vehicle
router.use('/vehicles', require('./vehicle'))
// Sale
router.use('/sales', require('./sale'))
// SaleAccount
router.use('/sale_accounts', require('./saleAccount'))
// Production
router.use('/productions', require('./production'))
// Delivery
router.use('/deliveries', require('./delivery'))
// Dashboard
router.use('/dashboard', require('./dashboard'))

// document:
router.use('/documents', require('./document'))



module.exports = router
