const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")
const { checkEmployeeOrAdmin } = require("../utilities/account-middleware")

// Public route: Build inventory by classification ID
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Public route: Build inventory item detail view
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildDetailView)
)

// Protected route: Inventory management dashboard
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(invController.buildManagementView)
)

// Protected route: Add classification form
router.get(
  "/add-classification",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)
router.post(
  "/add-classification",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.insertClassification)
)

// Protected route: Add inventory form
router.get(
  "/add-inventory",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)
router.post(
  "/add-inventory",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.insertInventory)
)

// Protected route: Edit inventory view
router.get(
  "/edit/:inv_id",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.editInventoryView)
)

// Protected route: Update inventory item
router.post(
  "/update",
  checkEmployeeOrAdmin,
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Public route: Get inventory JSON by classification
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

module.exports = router
