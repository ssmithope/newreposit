// Required modules
const express = require('express')
const router = express.Router()
const utilities = require('../utilities')
const accountController = require('../controllers/accountController')
const regValidate = require('../utilities/account-validation') // for login/register
const updateValidate = require('../utilities/account-update-validation') // for update/password

// Route to deliver login view
router.get('/login', utilities.handleErrors(accountController.buildLogin))

// Registration view route
router.get('/register', utilities.handleErrors(accountController.buildRegister))

// Registration POST route
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Default account management view
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

// Route to deliver account update view
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateView)
)

// Route to process account info update
router.post(
  "/update",
  updateValidate.updateAccountRules(),
  updateValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Route to process password update
router.post(
  "/update-password",
  updateValidate.passwordRules(),
  updateValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("jwt")
  req.flash("notice", "You have logged out.")
  res.redirect("/")
})

// Export the router
module.exports = router
