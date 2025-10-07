const express = require('express')
const router = express.Router()
const utilities = require('../utilities')
const accountController = require('../controllers/accountController')
const regValidate = require('../utilities/account-validation')
const updateValidate = require('../utilities/account-update-validation')

// Login view
router.get('/login', utilities.handleErrors(accountController.buildLogin))

// Registration view
router.get('/register', utilities.handleErrors(accountController.buildRegister))

// Registration POST
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Login POST
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Account management view
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

// Account update view
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateView)
)

// Account info update POST
router.post(
  "/update",
  utilities.checkLogin,
  updateValidate.updateAccountRules(),
  updateValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Password update POST
router.post(
  "/update-password",
  utilities.checkLogin,
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

module.exports = router
