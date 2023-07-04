const path = require("path");
const db = require("../routes/db_config");

function renderaddPage(req, res) {
  if (req.session.user && req.session.user.user_type === "Cashier") {
    res.render("add", { flash: req.flash() });
  } else {
    req.flash("error", "You are not authorized to access this page.");
    res.redirect("/");
  }
}

const createSalesOrder = (req, res) => {
  const { product_name, Date, Quantity, Temperature, AdvertisingCost, CompetitorPrice, CompetitorCount, Promotion } = req.body;
  
  // Create a connection to the database
  const connection = db.createConnection();

  // Fetch the product_id based on the product_name
  const getProductQuery = 'SELECT product_id FROM product WHERE product_name = ?';

  connection.query(getProductQuery, [product_name], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      req.flash('error', 'An error occurred while fetching the product');
      res.redirect('/add.ejs');
    } else {
      if (results.length === 0) {
        // If no product found, return an error
        req.flash('error', 'Product not found');
        res.redirect('/add.ejs');
      } else {
        const product_id = results[0].product_id;

        // Define the INSERT query for salesorder
        const insertQuery = 'INSERT INTO salesorder (product_id, Date, Quantity, Temperature, AdvertisingCost, CompetitorPrice, CompetitorCount, Promotion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

        // Execute the INSERT query
        connection.query(insertQuery, [product_id, Date, Quantity, Temperature, AdvertisingCost, CompetitorPrice, CompetitorCount, Promotion], (err, results) => {
          if (err) {
            console.error('Error inserting sales order:', err);
            req.flash('error', 'An error occurred while creating the sales order');
            res.redirect('/sales-order');
          } else {
            console.log('Data inserted successfully');
            req.flash('success', 'Sales order created successfully');
            res.redirect('/add.ejs');
          }
        });
      }
    }

    // Close the database connection
    connection.end();
  });
};

const addStock = (req, res, next) => {
  const { product_name, price, available_quantity } = req.body;

  // Create a connection to the database
  const connection = db.createConnection();

  // Define the INSERT query
  const query = 'INSERT INTO product (product_name, price, available_quantity) VALUES (?, ?, ?)';

  // Execute the INSERT query
  connection.query(query, [product_name, price, available_quantity], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      req.flash('error', 'An error occurred while inserting data');
      res.redirect('/add');
    } else {
      console.log('Data inserted successfully');
      req.flash('success', 'Data inserted successfully');
      res.redirect('/add');
    }

    // Close the database connection
    connection.end();
  });
};

module.exports = {
  renderaddPage,
  createSalesOrder,
  addStock,
};
