const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'ecims'
});

// Connect to MySQL
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send();
});

// Routes
// Example route for fetching customers
app.get('/api/customers', (req, res) => {
  connection.query('SELECT * FROM customer', (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

// Example route for adding a customer
app.post('/api/customers', (req, res) => {
  const { firstName, lastName, email, address } = req.body;
  const query = `INSERT INTO customer (CUSTOMER_FIRST_NAME, CUSTOMER_LAST_NAME, CUSTOMER_EMAIL, CUSTOMER_ADDRESS) 
                 VALUES ('${firstName}', '${lastName}', '${email}', '${address}')`;
  connection.query(query, (err, result) => {
    if (err) throw err;
    res.send('Customer added successfully');
  });
});

// Example route for deleting a customer
app.delete('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const query = `DELETE FROM customer WHERE CUSTOMER_ID = ${customerId}`;
  connection.query(query, (err, result) => {
    if (err) throw err;
    res.send('Customer deleted successfully');
  });
});

// Get all products
app.get('/api/products', (req, res) => {
  connection.query('SELECT * FROM product', (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

// Add a new product
app.post('/api/products', (req, res) => {
  const { name, brand, description, quantity_on_hand, coo, category } = req.body;
  const query = `INSERT INTO product (NAME, BRAND, DESCRIPTION, QUANTITY_ON_HAND, COO, CATEGORY) 
                 VALUES ('${name}', '${brand}', '${description}', '${quantity_on_hand}', '${coo}', '${category}')`;
  connection.query(query, (err, result) => {
    if (err) throw err;
    res.send('Product added successfully');
  });
});

// Delete a product by ID
app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const query = `DELETE FROM product WHERE PRODUCT_ID = ${productId}`;
  connection.query(query, (err, result) => {
    if (err) throw err;
    res.send('Product deleted successfully');
  });
});

// Get all suppliers
app.get('/api/suppliers', (req, res) => {
  connection.query('SELECT * FROM supplier', (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

// Add a new supplier
app.post('/api/suppliers', (req, res) => {
  const { name, contact, moq, address } = req.body;
  const query = `INSERT INTO supplier (NAME, CONTACT, MOQ, ADDRESS) 
                 VALUES ('${name}', '${contact}', '${moq}', '${address}')`;
  connection.query(query, (err, result) => {
    if (err) throw err;
    res.send('Supplier added successfully');
  });
});

// Delete a supplier by ID
app.delete('/api/suppliers/:id', (req, res) => {
  const supplierId = req.params.id;
  const query = `DELETE FROM supplier WHERE SUPPLIER_ID = ${supplierId}`;
  connection.query(query, (err, result) => {
    if (err) throw err;
    res.send('Supplier deleted successfully');
  });
});


// Get all promotions
app.get('/api/promotions', (req, res) => {
  connection.query('SELECT * FROM promotion', (err, rows) => {
    if (err) throw err;
    res.json(rows);
  });
});

// Add a new promotion
app.post('/api/promotions', (req, res) => {
  const { name, description, discount, valid_till } = req.body;
  const query = `INSERT INTO promotion (NAME, DESCRIPTION, DISCOUNT, VALID_TILL) 
                 VALUES ('${name}', '${description}', '${discount}', '${valid_till}')`;
  connection.query(query, (err, result) => {
    if (err) throw err;
    res.send('Promotion added successfully');
  });
});

// Delete a promotion by name
app.delete('/api/promotions/:name', (req, res) => {
  const promotionName = req.params.name;
  const query = `DELETE FROM promotion WHERE NAME = '${promotionName}'`;
  connection.query(query, (err, result) => {
    if (err) throw err;
    res.send('Promotion deleted successfully');
  });
});


// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
