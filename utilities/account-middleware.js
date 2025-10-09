// utilities/account-middleware.js
const jwt = require('jsonwebtoken')
require('dotenv').config()

function checkJWTToken(req, res, next) {
  const token = req.cookies && req.cookies.jwt
  res.locals.accountData = null
  if (!token) return next()
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    res.locals.accountData = {
      account_id: payload.account_id,
      account_email: payload.account_email,
      account_type: payload.account_type,
      account_firstname: payload.account_firstname,
      account_lastname: payload.account_lastname,
    }
    return next()
  } catch (err) {
    console.error('JWT verify error', err)
    res.clearCookie('jwt')
    return next()
  }
}

function requireRoleEmployee(req, res, next) {
  const acct = res.locals.accountData
  if (acct && (acct.account_type === 'Employee' || acct.account_type === 'Admin')) return next()
  return res.status(403).render('account/login', {
    title: 'Login',
    message: 'You must be signed in with an Employee or Admin account to access that resource.',
    nav: null,
  })
}

module.exports = { checkJWTToken, requireRoleEmployee }
