const express = require("express")
const router = new express.Router()
const baseController = require("../controllers/baseController")
const utilities = require("../utilities/")

// Home page
router.get("/", utilities.handleErrors(baseController.buildHome))

// Trigger error test
router.get("/trigger-error", utilities.handleErrors(baseController.triggerError))

// Suppress favicon.ico error
router.get("/favicon.ico", (req, res) => res.status(204).end())

module.exports = router
