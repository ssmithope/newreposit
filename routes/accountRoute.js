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
  utilities.checkLogin, utilities.handleErrors(accountController.buildManagement)
)

router.get("/update/:account_id", controller.buildUpdateView)
router.post("/update", validate.updateAccountRules(), validate.checkUpdateData, controller.updateAccount)
router.post("/update-password", validate.passwordRules(), validate.checkPasswordData, controller.updatePassword)

router.get("/logout", (req, res) => {
  res.clearCookie("jwt")
  req.flash("notice", "You have logged out.")
  res.redirect("/")
})

// Export the router
module.exports = router;
