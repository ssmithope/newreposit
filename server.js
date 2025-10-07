/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

const session = require("express-session")
const pool = require('./database/')
const cookieParser = require("cookie-parser")

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const path = require("path")
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const baseRoute = require("./routes/baseRoute")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities")

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Cookie parser
app.use(cookieParser())

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// JWT token middleware
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Middleware: Body parsers and static
 *************************/
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Serve static assets from /public if the project includes them
app.use(express.static(path.join(__dirname, "public")))

/* ***********************
 * Routes
 *************************/
app.use(static)

/* ***********************
 * Application Routes
 *************************/
// Base routes (home, about, etc.)
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes mounted at both /inv and /inventory to match links/templates
app.use("/inv", inventoryRoute)
app.use("/inventory", inventoryRoute)

// Account routes (login, register, etc.)
app.use("/account", accountRoute)

// Ignore browser favicon requests to avoid 404 noise
app.get("/favicon.ico", (req, res) => res.sendStatus(204))

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  
  let message
  if (err.status == 404) {
    message = err.message
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?'
  }

  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
