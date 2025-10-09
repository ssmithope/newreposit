const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    const data = await invModel.getClassifications()
    if (!data || !data.length) {
      throw new Error("No classification data returned.")
    }

    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'

    // The order: Custom → Sport → SUV → Truck → Sedan
    const order = ["Custom", "Sport", "SUV", "Truck", "Sedan"]

    order.forEach(name => {
      const row = data.find(c => c.classification_name === name)
      if (row) {
        list += `<li><a href="/inv/type/${row.classification_id}" 
                  title="See our inventory of ${row.classification_name} vehicles">
                  ${row.classification_name}</a></li>`
      }
    })

    list += "</ul>"
    return list
  } catch (error) {
    console.error("getNav error:", error)
    return "<ul><li><a href='/'>Home</a></li></ul>"
  }
}

/* **************************************
 * Build the classification view HTML
 *************************************** */
Util.buildInventoryGrid = async function (data) {
  let grid = ""
  if (data && data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      const thumbnail = vehicle.inv_thumbnail?.replace(
        "/vehicles/vehicles/vehicles/",
        "/vehicles/"
      ) || vehicle.inv_thumbnail

      grid += `<li>
        <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      </li>`
    })
    grid += "</ul>"
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build the vehicle detail view HTML
 *************************************** */
Util.buildVehicleDetail = function (vehicle) {
  const price = vehicle.inv_price?.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  }) || "$0"

  const miles = vehicle.inv_miles?.toLocaleString() || "0"

  const image = vehicle.inv_image?.replace(
    "/vehicles/vehicles/vehicles/",
    "/vehicles/"
  ) || vehicle.inv_image

  return `
    <section class="vehicle-detail">
      <img src="${image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Mileage:</strong> ${miles} miles</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
      </div>
    </section>
  `
}

/* ****************************************
 * Build Classification Dropdown List
 **************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  try {
    const data = await invModel.getClassifications()
    if (!data || !data.length) {
      throw new Error("No classification data returned.")
    }

    let classificationList = '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.forEach((row) => {
      classificationList += `<option value="${row.classification_id}"`
      if (classification_id != null && row.classification_id == classification_id) {
        classificationList += " selected"
      }
      classificationList += `>${row.classification_name}</option>`
    })
    classificationList += "</select>"
    return classificationList
  } catch (error) {
    console.error("buildClassificationList error:", error)
    return '<select name="classification_id" id="classificationList"><option value="">No classifications available</option></select>'
  }
}

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    next()
  }
}

/* ****************************************
 * Check Login
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

module.exports = Util
