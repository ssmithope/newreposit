// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require('../utilities')

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Route to show vehicle details by inv_id
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.showVehicleDetail)
)

// Management view
router.get(
  "/",
  utilities.handleErrors(invController.buildManagementView)
)

// Add classification
router.get(
  "/add-classification",
  invController.showAddClassification
)

router.post(
  "/add-classification",
  utilities.handleErrors(invController.addClassification)
)

// Get inventory JSON
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

// Edit inventory
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
)

router.post(
  "/update/",
  utilities.handleErrors(invController.updateInventory)
)

// Add inventory
router.get(
  "/add-inventory",
  invController.addInventory
)

router.post(
  "/add-inventory",
  utilities.handleErrors(invController.addInventory)
)

module.exports = router
