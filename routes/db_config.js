const mysql = require('mysql2');

// Create a MySQL pool
function createConnection() {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'supermarket'
  });

  connection.connect(function(err) {
    if (err) throw err;
    console.log('Database connected!');
  });

  return connection;
}

// Export the createConnection function
module.exports = {
  createConnection
};
