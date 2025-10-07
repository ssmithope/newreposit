const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

/* ****************************************
 * Build inventory by classification ID
 * **************************************** */
async function buildByClassificationId(req, res, next) {
  try {
    const classificationId = req.params.classificationId
    const inventoryData = await invModel.getInventoryByClassificationId(classificationId)

    if (!inventoryData || inventoryData.length === 0) {
      throw { status: 404, message: "No vehicles found for this classification." }
    }

    const classificationName = await invModel.getClassificationName(classificationId)
    const nav = await utilities.getNav()
    const grid = await utilities.buildInventoryGrid(inventoryData)

    res.render("inventory/classification", {
      title: `${classificationName} Vehicles`,
      nav,
      grid
    })
  } catch (error) {
    next(error)
  }
}


/* ****************************************
 * Build inventory detail view
 * **************************************** */
async function buildDetailView(req, res, next) {
  try {
    const invId = req.params.invId
    const data = await invModel.getVehicleById(invId)

    if (!data) {
      throw { status: 404, message: "Vehicle not found." }
    }

    const nav = await utilities.getNav()
    const detail = await utilities.buildVehicleDetail(data)

    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      detail
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Build inventory management view
 * **************************************** */
async function buildManagementView(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      message: req.flash("notice"),
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Build add classification view
 * **************************************** */
async function buildAddClassification(req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: req.flash("notice"),
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Insert new classification
 * **************************************** */
async function insertClassification(req, res, next) {
  try {
    const { classification_name } = req.body
    const result = await invModel.addClassification(classification_name)
    if (result) {
      req.flash("notice", `Classification "${classification_name}" added successfully.`)
      res.redirect("/inv/")
    } else {
      req.flash("notice", "Failed to add classification.")
      res.redirect("/inv/add-classification")
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Build add inventory view
 * **************************************** */
async function buildAddInventory(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      message: req.flash("notice"),
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Insert new inventory item
 * **************************************** */
async function insertInventory(req, res, next) {
  try {
    const result = await invModel.addInventory(req.body)
    if (result) {
      req.flash("notice", "Inventory item added successfully.")
      res.redirect("/inv/")
    } else {
      req.flash("notice", "Failed to add inventory item.")
      res.redirect("/inv/add-inventory")
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Build edit inventory view
 * **************************************** */
async function editInventoryView(req, res, next) {
  try {
    const invId = req.params.inv_id
    const itemData = await invModel.getVehicleById(invId)
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)

    res.render("inventory/edit-inventory", {
      title: `Edit ${itemData.inv_make} ${itemData.inv_model}`,
      nav,
      classificationSelect,
      itemData,
      message: req.flash("notice"),
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Update inventory item
 * **************************************** */
async function updateInventory(req, res, next) {
  try {
    const result = await invModel.updateInventory(req.body)
    if (result) {
      req.flash("notice", "Inventory updated successfully.")
      res.redirect("/inv/")
    } else {
      req.flash("notice", "Update failed.")
      res.redirect(`/inv/edit/${req.body.inv_id}`)
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 * Return inventory JSON by classification
 * **************************************** */
async function getInventoryJSON(req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id)
    const inventory = await invModel.getInventoryByClassificationId(classification_id)
    res.json(inventory)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  buildByClassificationId,
  buildDetailView,
  buildManagementView,
  buildAddClassification,
  insertClassification,
  buildAddInventory,
  insertInventory,
  editInventoryView,
  updateInventory,
  getInventoryJSON
}
