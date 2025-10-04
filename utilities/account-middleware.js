const jwt = require("jsonwebtoken")

/* ***************************
 * Middleware to check if user is Employee or Admin
 * ************************** */
function checkEmployeeOrAdmin(req, res, next) {
  const token = req.cookies.jwt
  if (!token) {
    req.flash("notice", "Please log in to access this area.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check account type
    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      res.locals.loggedin = true
      res.locals.accountData = decoded
      next()
    } else {
      req.flash("notice", "Access restricted to employees or admins.")
      return res.redirect("/account/login")
    }
  } catch (err) {
    console.error("JWT verification failed:", err)
    req.flash("notice", "Invalid session. Please log in again.")
    return res.redirect("/account/login")
  }
}

module.exports = { checkEmployeeOrAdmin }
