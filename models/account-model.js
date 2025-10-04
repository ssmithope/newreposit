// Require the database connection
const pool = require('../database/')

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
      ) VALUES ($1, $2, $3, $4, 'client') RETURNING *`
    
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password
    ])
  } catch (error) {
    throw error
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

async function getAccountById(account_id) {
  const sql = "SELECT * FROM account WHERE account_id = $1"
  const result = await pool.query(sql, [account_id])
  return result.rows[0]
}

async function updateAccount(data) {
  const sql = `UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4`
  const result = await pool.query(sql, [data.account_firstname, data.account_lastname, data.account_email, data.account_id])
  return result.rowCount
}

async function updatePassword(account_id, hashedPassword) {
  const sql = `UPDATE account SET account_password = $1 WHERE account_id = $2`
  const result = await pool.query(sql, [hashedPassword, account_id])
  return result.rowCount
}

module.exports = { registerAccount, getAccountByEmail, getAccountById, updateAccount, updatePassword }
