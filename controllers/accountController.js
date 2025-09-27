const utilities = require('../utilities')
const accountModel = require('../models/account-model') 

/* ****************************************
 * Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
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
async function buildRegister(req, res, next) {
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
async function registerAccount(req, res, next) {
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

module.exports = { buildLogin, buildRegister, registerAccount }
