const path = require('path');
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'supermarket',
});

function renderReportsPage(req, res) {
  if (req.session.user && req.session.user.user_type === 'Sales Manager') {
    const query = `
    SELECT product.product_name, SUM(salesorder.quantity) AS total_quantity, product.available_quantity
    FROM salesorder
    JOIN product ON salesorder.product_id = product.product_id
    GROUP BY product.product_name, product.available_quantity`;
  
    connection.query(query, (error, results) => {
        if (error) {
          console.error(error);
        return res.status(500).send('Error retrieving sales data');
        }

        const salesOrders = results.map((order) => ({
        Quantity: order.Quantity,
        Total: order.Total,
        product_name: order.product_name,
        available_quantity: order.available_quantity,
        }));

      const recordsPerPage = 10;
      const currentPage = req.query.page || 1;
      const startIndex = (currentPage - 1) * recordsPerPage;
      const endIndex = startIndex + recordsPerPage;
      const paginatedOrders = salesOrders.slice(startIndex, endIndex);

      res.render('reports', {
        salesOrders: salesOrders,
        paginatedOrders: paginatedOrders,
        currentPage: currentPage,
        recordsPerPage: recordsPerPage,
      });
    });
  } else {
    res.redirect('/');
  }
}


const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


function graphdata(req, res) {
  const productName = req.params.product_name;

  const query = `
    SELECT MONTH(salesorder.date) AS month, SUM(salesorder.quantity) AS totalQuantity
    FROM salesorder
    JOIN product ON salesorder.product_id = product.product_id
    WHERE product.product_name = ?
    GROUP BY MONTH(salesorder.date)
    ORDER BY MONTH(salesorder.date)
  `;

  connection.query(query, [productName], (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      return res.status(500).json({ error: 'An error occurred' });
    }

    const graphData = results.map((row) => ({
      month: monthNames[row.month - 1],  // Subtract 1 to match the array index
      totalQuantity: row.totalQuantity,
    }));

    res.json(graphData);
  });
}

module.exports = {
  renderReportsPage,
  graphdata,
};
