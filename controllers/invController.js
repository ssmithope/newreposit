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
  if (!data || data.length === 0) {
  req.flash("notice", "No classification data found.")
  return res.redirect("/some-safe-route") // or render a fallback view
}
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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
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

/* ***************************
 * Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0]?.inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Process inventory update
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const updateResult = await invModel.updateInventory(req.body)

  if (updateResult) {
    req.flash("notice", `The ${req.body.inv_make} ${req.body.inv_model} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("./inventory/edit-inventory", {
      title: "Edit " + req.body.inv_make + " " + req.body.inv_model,
      nav,
      classificationSelect,
      errors: null,
      ...req.body
    })
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = inv_make + " " + inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

module.exports = invCont
