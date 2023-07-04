const path = require('path');
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'supermarket',
});
function renderReportsPage(req, res) {
  if (req.session.user && req.session.user.user_type === "Sales Manager") {
    connection.query('SELECT salesdata_id, quantity, date, product.product_name FROM salesorder JOIN product ON salesorder.product_id = product.product_id', (error, results) => {
      if (error) {
        // Handle the error
        console.error(error);
        return;
      }
      
      const salesOrders = results.map((order) => {
        return {
          ...order,
          date: new Date(order.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }),
        };
      });
  
      res.render('reports', { salesOrders: salesOrders });
    });
  } else {
    res.redirect("/");
  }
  }
  
  module.exports = {
    renderReportsPage,
  };