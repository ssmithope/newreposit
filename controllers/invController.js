const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildInventoryGrid(data);

  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  });
};

/* ***************************
 *  Show vehicle detail
 * ************************** */
invCont.showVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;
    console.log(`Querying database for inv_id: ${inv_id}`);
    const vehicleData = await invModel.getVehicleByInvId(inv_id);
    console.log("Vehicle Data in Controller:", vehicleData);

    if (!vehicleData) {
      req.flash("notice", "Vehicle not found.");
      return res.redirect("/inv");
    }

    let nav = await utilities.getNav();
    const detailHtml = utilities.buildVehicleDetail(vehicleData);

    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      detailHtml,
      message: req.flash("notice"),
    });
  } catch (error) {
    console.error("Error in showVehicleDetail:", error);
    next(error);
  }
};

/* ***************************
 *  Management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  console.log("Building management view");
  let nav = await utilities.getNav();
  const classifications = await invModel.getClassifications();
  const classificationSelect = await utilities.buildClassificationList(classifications);
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationSelect,
  });
};

/* ***************************
 *  Add classification view
 * ************************** */
invCont.showAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/addClassification", {
    title: "Add Vehicle Classification",
    flash: req.flash("info"),
    nav,
    errors: null,
  });
};

/* ***************************
 *  Add inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body;
  const errors = [];

  if (!classification_id || !inv_make || !inv_model || !inv_year || !inv_description || !inv_image || !inv_thumbnail || !inv_price || !inv_miles || !inv_color) {
    errors.push({ msg: "All fields are required." });
  }

  if (errors.length > 0) {
    let classifications = await invModel.getClassifications();
    res.render("inventory/addInventory", {
      title: "Add New Vehicle",
      flash: null,
      nav,
      errors,
      classifications,
    });
  } else {
    try {
      await invModel.insertVehicle({
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      });
      req.flash("info", "Vehicle added successfully.");
      nav = await utilities.getNav();
      res.redirect("/inv");
    } catch (err) {
      errors.push({ msg: err.message });
      let classifications = await invModel.getClassifications();
      res.render("inventory/addInventory", {
        title: "Add New Vehicle",
        flash: null,
        nav,
        errors,
        classifications,
      });
    }
  }
};

/* ***************************
 *  Add classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  const errors = [];

  const regex = /^[a-zA-Z0-9]+$/;
  if (!regex.test(classification_name)) {
    errors.push({ msg: "Classification name cannot contain spaces or special characters." });
  }

  if (errors.length > 0) {
    res.render("inventory/addClassification", {
      title: "Add Vehicle Classification",
      flash: null,
      nav,
      errors,
    });
  } else {
    try {
      await invModel.insertClassification(classification_name);
      req.flash("info", "Classification added successfully.");
      nav = await utilities.getNav();
      res.redirect("/inv");
    } catch (err) {
      errors.push({ msg: err.message });
      res.render("inventory/addClassification", {
        title: "Add Vehicle Classification",
        flash: null,
        nav,
        errors,
      });
    }
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id, 10);
  if (isNaN(classification_id)) {
    return res.status(400).json({ error: "Invalid classification_id" });
  }
  try {
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    if (invData.length > 0) {
      return res.json(invData);
    } else {
      return res.status(404).json({ error: "No inventory found for this classification" });
    }
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getVehicleByInvId(inv_id);
  const classifications = await invModel.getClassificationsForEditForm();
  const classificationSelect = await utilities.buildClassificationList(classifications, itemData.classification_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    flash: req.flash("info"),
    nav,
    classificationSelect,
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
    classification_id: itemData.classification_id,
  });
};

module.exports = invCont;
