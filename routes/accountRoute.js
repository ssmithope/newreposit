// Required modules
const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation')

// Route to deliver login view
router.get('/login', utilities.handleErrors(accountController.buildLogin));

// Registration view route
router.get('/register', utilities.handleErrors(accountController.buildRegister));

// Registration POST route
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)
// Export the router
module.exports = router;
