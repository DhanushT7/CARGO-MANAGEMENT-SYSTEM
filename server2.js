const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

// Create connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'M&Papw4in',
    database: 'ecims'
});

const app = express();

// Middleware
app.use(bodyParser.json());

// Add a new customer
app.post('/customer', (req, res) => {
  const { firstName, lastName, email, address } = req.body;
  const sql = 'INSERT INTO CUSTOMER (CUSTOMER_FIRST_NAME, CUSTOMER_LAST_NAME, CUSTOMER_EMAIL, CUSTOMER_ADDRESS) VALUES (?, ?, ?, ?)';
  pool.query(sql, [firstName, lastName, email, address], (error, results, fields) => {
    if (error) throw error;
    res.send('Customer added successfully');
  });
});

// Delete a customer by ID
app.delete('/customer/:id', (req, res) => {
  const customerId = req.params.id;
  const sql = 'DELETE FROM CUSTOMER WHERE CUSTOMER_ID = ?';
  pool.query(sql, [customerId], (error, results, fields) => {
    if (error) throw error;
    res.send('Customer deleted successfully');
  });
});

// Add more routes for order, product, and supplier tables (similar to above)

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server running on port ${PORT}`);
});