const router = require("express").Router();

// User
router.use('/users', require('./user'))
// Auth
router.use('/auth', require('./auth'))


module.exports = router
