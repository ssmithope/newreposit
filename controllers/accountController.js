const accountModel = require('../models/account-model');
const utilities = require('../utilities');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
* Deliver login view
**************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    message: req.flash("notice")
  });
}

/* ****************************************
* Deliver registration view
**************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    message: req.flash("notice")
  });
}

/* ****************************************
* Process Registration
**************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      message: req.flash("notice")
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash("notice", `Congratulations, you are registered ${account_firstname}. Please log in.`);
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      message: req.flash("notice")
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      message: req.flash("notice")
    });
  }
}

/* ****************************************
* Process login request
**************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      message: req.flash("notice")
    });
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;

      // Store account_type in session
      req.session.account_type = accountData.account_type;

      // Sign JWT
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 3600 * 1000
      });

      return res.redirect("/account/accountManagement/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        message: req.flash("notice")
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    req.flash("notice", "Login failed. Please try again.");
    return res.redirect("/account/login");
  }
}

/* ****************************************
* Deliver account management view
**************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav();
  try {
    const accountData = res.locals.accountData; // from JWT middleware
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
      accountData,
      message: req.flash("notice")
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
* Deliver update account view
**************************************** */
async function buildUpdate(req, res) {
  let nav = await utilities.getNav();
  const account_id = req.params.account_id;
  const account = await accountModel.getAccountById(account_id);
  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    message: req.flash("notice"),
    account_id: account.account_id,
    account_firstname: account.account_firstname,
    account_lastname: account.account_lastname,
    account_email: account.account_email
  });
}

/* ****************************************
* Process account info update
**************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
  if (result) {
    req.flash("notice", "Account information updated.");
    return res.redirect("/account/");
  } else {
    req.flash("notice", "Update failed. Please correct errors.");
    return res.status(400).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      message: req.flash("notice"),
      account_id,
      account_firstname,
      account_lastname,
      account_email
    });
  }
}

/* ****************************************
* Process password change
**************************************** */
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;
  const hashedPassword = await bcrypt.hash(account_password, 10);
  const result = await accountModel.updatePassword(account_id, hashedPassword);
  if (result) {
    req.flash("notice", "Password updated.");
    return res.redirect("/account/");
  } else {
    req.flash("notice", "Password update failed.");
    let nav = await utilities.getNav();
    return res.status(400).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      message: req.flash("notice"),
      account_id
    });
  }
}

/* ****************************************
* Logout
**************************************** */
function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  return res.redirect("/");
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdate,
  updateAccount,
  updatePassword,
  logout
};
