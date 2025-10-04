const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const updateValidate = {}

/* ***************************
 * Account Update Validation Rules
 * ************************** */
updateValidate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required."),
    body("account_lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required."),
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required.")
      .custom(async (email, { req }) => {
        const existingAccount = await accountModel.getAccountByEmail(email)
        if (existingAccount && existingAccount.account_id != req.body.account_id) {
          throw new Error("Email already exists. Please use a different one.")
        }
      })
  ]
}

/* ***************************
 * Password Validation Rules
 * ************************** */
updateValidate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      })
      .withMessage("Password must be at least 12 characters and include uppercase, number, and special character.")
  ]
}

/* ***************************
 * Check and return validation errors
 * ************************** */
updateValidate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const accountData = req.body
    let nav = await require("../utilities").getNav()
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      message: null,
      errors: errors.array()
    })
    return
  }
  next()
}

updateValidate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await require("../utilities").getNav()
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      account_id: req.body.account_id,
      account_firstname: "",
      account_lastname: "",
      account_email: "",
      message: null,
      errors: errors.array()
    })
    return
  }
  next()
}

module.exports = updateValidate
