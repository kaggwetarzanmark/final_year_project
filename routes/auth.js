const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { createConnection } = require("../routes/db_config");

// Function to authenticate user
function authenticateUser(email, password, done) {
  // Create a MySQL connection
  const connection = createConnection();

  // Find user in the database based on the provided email
  const query = "SELECT * FROM users WHERE email = ?";
  const values = [email];

  connection.query(query, values, (err, rows) => {
    connection.end(); // Close the MySQL connection

    if (err) {
      return done(err);
    }

    // Check if the user exists
    const user = rows[0];
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return done(error);
    }

    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return done(err);
      }

      if (!isMatch) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        return done(error);
      }

      // Authentication successful
      return done(null, user);
    });
  });
}

// Middleware to protect routes
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    // User is authenticated, allow access to the next middleware or route handler
    next();
  } else {
    // User is not authenticated, redirect to the login form
    res.redirect("/");
  }
}

// Define the login route
router.post("/", (req, res, next) => {
  const { email, password } = req.body;

  // Authenticate the user
  authenticateUser(email, password, (err, user) => {
    if (err) {
      console.error("Error authenticating user:", err);
      return next(err);
    }

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return res.status(error.statusCode).send(error.message);
    }

    // Set the user object in the session
    req.session.user = user;

    if (user.user_type === "Sales Manager") {
      return res.redirect("/reports");
    } else if (user.user_type === "Cashier") {
      return res.redirect("/add");
    } else {
      const error = new Error("Invalid user role");
      error.statusCode = 401;
      return res.status(error.statusCode).send(error.message);
    }
  });
});

// Define the logout route
router.get("/logout", (req, res) => {
  // Clear the user object from the session
  req.session.user = null;
  res.redirect("/");
});

module.exports = { router, isAuthenticated };
