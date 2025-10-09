const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const validate = {}

/* **********************************
 * Registration Data Validation Rules
 ********************************** */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim().escape().notEmpty().isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim().escape().notEmpty().isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim().escape().notEmpty().isEmail().normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please login or use different email")
        }
      }),
    body("account_password")
      .trim().notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

validate.loginRules = () => {
  return [
    body("account_email")
      .trim().escape().notEmpty().isEmail().normalizeEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim().notEmpty()
      .withMessage("Password is required."),
  ]
}

/* ******************************
 * Update Account Validation Rules
 ****************************** */
validate.updateRules = () => {
  return [
    body("account_firstname")
      .trim().escape().notEmpty().isLength({ min: 1 })
      .withMessage("First name is required."),
    body("account_lastname")
      .trim().escape().notEmpty().isLength({ min: 2 })
      .withMessage("Last name is required."),
    body("account_email")
      .trim().escape().notEmpty().isEmail().normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const existing = await accountModel.checkExistingEmail(account_email)
        if (existing && Number(existing.account_id) !== Number(req.body.account_id)) {
          throw new Error("Email already in use.")
        }
      }),
  ]
}

/* ******************************
 * Password Update Validation Rules
 ****************************** */
validate.passwordRules = () => {
  return [
    body("account_password")
      .trim().notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Error Checkers
 ****************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
  }
  next()
}

validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
  next()
}

validate.checkUpdateData = async (req, res, next) => {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/update-account", {
      errors,
      title: "Update Account",
      nav,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
  next()
}

validate.checkPasswordData = async (req, res, next) => {
  const { account_id } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/update-account", {
      errors,
      title: "Update Account",
      nav,
      account_id,
    })
  }
  next()
}

/* ******************************
 * Role-based Access Middleware
 ****************************** */
validate.checkEmployeeOrAdmin = (req, res, next) => {
  const accountType = res.locals?.accountData?.account_type
  if (accountType === "Admin" || accountType === "Employee") {
    return next()
  }
  req.flash("notice", "You do not have access to that page.")
  return res.redirect("/")
}

module.exports = validate
