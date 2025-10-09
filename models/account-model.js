const pool = require("../database/")

/* *****************************
* Register new account
***************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  const sql = `
    INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
    VALUES ($1, $2, $3, $4, 'Client')
    RETURNING *`
  const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  return result.rows[0]
}

async function checkExistingEmail(account_email) {
  const sql = "SELECT account_id FROM account WHERE account_email = $1"
  const result = await pool.query(sql, [account_email])
  return result.rows[0]
}

async function getAccountByEmail(account_email) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
    FROM account
    WHERE account_email = $1`
  const result = await pool.query(sql, [account_email])
  return result.rows[0]
}

async function getAccountById(account_id) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_type
    FROM account
    WHERE account_id = $1`
  const result = await pool.query(sql, [account_id])
  return result.rows[0]
}

async function getAllAccounts() {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_type
    FROM account
    ORDER BY account_id ASC`
  const result = await pool.query(sql)
  return result.rows
}

async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  const sql = `
    UPDATE account
    SET account_firstname = $1, account_lastname = $2, account_email = $3
    WHERE account_id = $4
    RETURNING *`
  const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
  return result.rows[0]
}

async function updatePassword(account_id, hashedPassword) {
  const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
  const result = await pool.query(sql, [hashedPassword, account_id])
  return result.rows[0]
}

async function deleteAccount(account_id) {
  const sql = "DELETE FROM account WHERE account_id = $1"
  const result = await pool.query(sql, [account_id])
  return result.rowCount
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  getAllAccounts,
  updateAccount,
  updatePassword,
  deleteAccount
}
