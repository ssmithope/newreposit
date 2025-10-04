const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")
const { checkEmployeeOrAdmin } = require("../utilities/account-middleware")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to build inventory item detail view
router.get("/detail/:invId", invController.buildDetailView)

// Management view (protected)
router.get("/", utilities.checkLogin, utilities.handleErrors(invController.buildManagementView))

// Add classification form
router.get("/add-classification", checkEmployeeOrAdmin, invController.buildAddClassification)
router.post("/add-classification", checkEmployeeOrAdmin, invController.insertClassification)

// Add inventory form
router.get("/add-inventory", checkEmployeeOrAdmin, invController.buildAddInventory)
router.post("/add-inventory", checkEmployeeOrAdmin, invController.insertInventory)

// Route to build the edit inventory view
router.get("/edit/:inv_id", checkEmployeeOrAdmin, utilities.handleErrors(invController.editInventoryView))

// Route to handle inventory update
router.post(
  "/update",
  checkEmployeeOrAdmin,
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Get inventory JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

module.exports = router
