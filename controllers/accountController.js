const utilities = require('../utilities')
const accountModel = require('../models/account-model') 
const accountController = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcryptjs")

/* ****************************************
 * Deliver login view
 * *************************************** */
accountController.buildLogin = async (req, res, next) => {
  try {
    let nav = await utilities.getNav()
    res.render('account/login', {
      title: 'Login',
      nav,
      message: req.flash('notice') 
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Deliver registration view
 * *************************************** */
accountController.buildRegister = async (req, res, next) => {
  try {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      message: null,
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Process Registration
 * *************************************** */
accountController.registerAccount = async (req, res, next) => {
  try {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    )
    
    if (regResult.rowCount > 0) { 
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      res.status(201).render("account/login", {
        title: "Login",
        nav,
        message: req.flash("notice")
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Register",
        nav,
        message: req.flash("notice"),
        errors: null
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async (req, res) => {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 * Deliver account management view
 * *************************************** */
accountController.buildAccountManagement = async (req, res, next) => {
  try {
    let nav = await utilities.getNav()
    const accountData = res.locals.accountData
    res.render("account/account", {
      title: "Account Management",
      nav,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_type: accountData.account_type,
      message: req.flash("notice"),
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Deliver account update view
 * *************************************** */
accountController.buildUpdateView = async (req, res, next) => {
  try {
    const account_id = req.params.account_id
    const accountData = await accountModel.getAccountById(account_id)
    let nav = await utilities.getNav()
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      message: req.flash("notice"),
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Process account info update
 * *************************************** */
accountController.updateAccount = async (req, res, next) => {
  try {
    const result = await accountModel.updateAccount(req.body)
    const accountData = await accountModel.getAccountById(req.body.account_id)
    let nav = await utilities.getNav()
    if (result) {
      req.flash("notice", "Account updated successfully.")
    } else {
      req.flash("notice", "Update failed.")
    }
    res.render("account/account", {
      title: "Account Management",
      nav,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_type: accountData.account_type,
      message: req.flash("notice"),
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Process password update
 * *************************************** */
accountController.updatePassword = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.account_password, 10)
    const result = await accountModel.updatePassword(req.body.account_id, hashedPassword)
    const accountData = await accountModel.getAccountById(req.body.account_id)
    let nav = await utilities.getNav()
    if (result) {
      req.flash("notice", "Password updated.")
    } else {
      req.flash("notice", "Password update failed.")
    }
    res.render("account/account", {
      title: "Account Management",
      nav,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_type: accountData.account_type,
      message: req.flash("notice"),
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

module.exports = accountController
