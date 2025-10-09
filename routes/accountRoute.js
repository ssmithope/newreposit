const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');

/* ********************************************
* Deliver Login View
********************************************* */
router.get("/login", utilities.handleErrors(accountController.buildLogin));

/* ********************************************
* Process the login request
********************************************* */
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

/* ********************************************
* Deliver Registration View
********************************************* */
router.get("/register", utilities.handleErrors(accountController.buildRegister));

/* ********************************************
* Register Account
********************************************* */
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

/* ********************************************
* Account Management View
********************************************* */
router.get(
  "/accountManagement",
  utilities.checkLogin, // must be logged in
  utilities.handleErrors(accountController.buildAccountManagement)
);

/* ********************************************
* Update Account View
********************************************* */
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdate)
);

/* ********************************************
* Process Account Update
********************************************* */
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

/* ********************************************
* Process Password Update
********************************************* */
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
);

/* ********************************************
* Logout
********************************************* */
router.get("/logout", accountController.logout);

module.exports = router;
