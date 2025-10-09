const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    // Order by classification_id instead of name
    const result = await pool.query(
      "SELECT classification_id, classification_name FROM classification ORDER BY classification_id"
    )
    return result.rows   // <-- must return rows, not result
  } catch (error) {
    console.error("getClassifications error:", error)
    return []
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )

    // Log the result for debugging purposes
    console.log("Data fetched:", data.rows);
    
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getVehicleByInvId(inv_id) {
  try {
    console.log(`Querying database for inv_id: ${inv_id}`);
    
    const result = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,
      [inv_id]
    )

    console.log("Vehicle data returned: ", result.rows)
    
    return result.rows[0]
  } catch (error) {
    console.error("getVehicleById error: " + error)
  }
}

// Function to insert a new classification
async function insertClassification(classification_name) {
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1)"
    console.log("Executing query:", sql, "with values:", classification_name)
    const result = await pool.query(sql, [classification_name])
    console.log("Insert result:", result)
    return result
  } catch (error) {
    console.error("insertClassification error:", error)
  }
}

const insertVehicle = async function(vehicle) {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = vehicle;
  const sql = `
    INSERT INTO public.inventory 
    (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;
  const result = await pool.query(sql, [classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color]);
  return result;
};

// Function to get classifications for the edit form
async function getClassificationsForEditForm() {
  // Also order by ID here for consistency
  const result = await pool.query('SELECT * FROM public.classification ORDER BY classification_id');
  return result.rows; // Return only the rows (array of classifications)
}

module.exports = {
  getClassifications, 
  getInventoryByClassificationId,
  getVehicleByInvId,
  insertClassification,
  insertVehicle,
  getClassificationsForEditForm
};
