const pool = require("../database")

/* ***************************
 * Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    const result = await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
    return result.rows
  } catch (error) {
    console.error("getClassifications error:", error)
    throw error
  }
}

/* ***************************
 * Get classification name by ID
 * ************************** */
async function getClassificationName(classification_id) {
  try {
    const result = await pool.query(
      "SELECT classification_name FROM classification WHERE classification_id = $1",
      [classification_id]
    )
    return result.rows[0]?.classification_name || "Unknown"
  } catch (error) {
    console.error("getClassificationName error:", error)
    throw error
  }
}

/* ***************************
 * Get all inventory items by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    )
    return result.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error)
    throw error
  }
}

/* ***************************
 * Get vehicle data by inventory id
 * ************************** */
async function getVehicleById(invId) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.inventory AS i
       JOIN public.classification AS c
       ON i.classification_id = c.classification_id
       WHERE i.inv_id = $1`,
      [invId]
    )
    return result.rows[0]
  } catch (error) {
    console.error("getVehicleById error:", error)
    throw error
  }
}

/* ***************************
 * Add Classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1)"
    const result = await pool.query(sql, [classification_name])
    return result.rowCount
  } catch (error) {
    console.error("addClassification error:", error)
    return null
  }
}

/* ***************************
 * Add Inventory Item
 * ************************** */
async function addInventory(data) {
  try {
    const sql = `INSERT INTO inventory (
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`
    
    const values = [
      data.inv_make, data.inv_model, data.inv_year, data.inv_description,
      data.inv_image, data.inv_thumbnail, data.inv_price, data.inv_miles,
      data.inv_color, data.classification_id
    ]

    const result = await pool.query(sql, values)
    return result.rowCount
  } catch (error) {
    console.error("addInventory error:", error)
    return null
  }
}

/* ***************************
 * Update Inventory Data
 * ************************** */
async function updateInventory(data) {
  try {
    const sql = `UPDATE public.inventory
      SET inv_make = $1,
          inv_model = $2,
          inv_description = $3,
          inv_image = $4,
          inv_thumbnail = $5,
          inv_price = $6,
          inv_year = $7,
          inv_miles = $8,
          inv_color = $9,
          classification_id = $10
      WHERE inv_id = $11
      RETURNING *`

    const values = [
      data.inv_make,
      data.inv_model,
      data.inv_description,
      data.inv_image,
      data.inv_thumbnail,
      data.inv_price,
      data.inv_year,
      data.inv_miles,
      data.inv_color,
      data.classification_id,
      data.inv_id
    ]

    const result = await pool.query(sql, values)
    return result.rows[0]
  } catch (error) {
    console.error("updateInventory error:", error)
    return null
  }
}

module.exports = {
  getClassifications,
  getClassificationName,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory,
  updateInventory
}
