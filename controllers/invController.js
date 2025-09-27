const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const invId = req.params.invId
  const data = await invModel.getVehicleById(invId)
  const nav = await utilities.getNav()
  const vehicleHtml = utilities.buildVehicleDetail(data)
  const title = `${data.inv_make} ${data.inv_model}`

  res.render("./inventory/detail", {
    title,
    nav,
    vehicleHtml
  })
}

/* ***************************
 *  Management View
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash("message")
  })
}

/* ***************************
 *  Add Classification View
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    message: req.flash("message")
  })
}

/* ***************************
 *  Insert Classification
 * ************************** */
invCont.insertClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash("message", "Classification added successfully.")
    res.redirect("/inventory/")
  } else {
    req.flash("message", "Failed to add classification.")
    res.redirect("/inventory/add-classification")
  }
}

/* ***************************
 *  Add Inventory View
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    message: req.flash("message")
  })
}

/* ***************************
 *  Insert Inventory Item
 * ************************** */
invCont.insertInventory = async function (req, res, next) {
  const data = req.body
  const result = await invModel.addInventory(data)

  if (result) {
    req.flash("message", "Inventory item added successfully.")
    res.redirect("/inventory/")
  } else {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(data.classification_id)
    req.flash("message", "Failed to add inventory item.")
    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      ...data,
      message: req.flash("message")
    })
  }
}

module.exports = invCont
