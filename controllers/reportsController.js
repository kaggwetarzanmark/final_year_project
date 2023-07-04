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
  function graphdata(req, res) {
    connection.query(`
      SELECT product.product_name, WEEK(salesorder.date) AS week, SUM(salesorder.quantity) AS weekly_sales, 
             MONTH(salesorder.date) AS month, SUM(salesorder.quantity) AS monthly_sales
      FROM salesorder
      JOIN product ON salesorder.product_id = product.product_id
      GROUP BY product.product_name, WEEK(salesorder.date), MONTH(salesorder.date)
    `, (error, results) => {
      if (error) {
        // Handle the error
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
  
      try {
        const salesOrders = results.map((order) => {
          return {
            productName: order.product_name,
            weeklySales: order.weekly_sales,
            monthlySales: order.monthly_sales,
          };
        });
  
        res.json(salesOrders);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
      }
    });
  }
  


  
  module.exports = {
    renderReportsPage,graphdata
  };