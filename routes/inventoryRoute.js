// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to build inventory item detail view
router.get("/detail/:invId", invController.buildDetailView)

// Management view
router.get("/", invController.buildManagementView)

// Add classification form
router.get("/add-classification", invController.buildAddClassification)
router.post("/add-classification", invController.insertClassification)

// Add inventory form
router.get("/add-inventory", invController.buildAddInventory)
router.post("/add-inventory", invController.insertInventory)

module.exports = router
