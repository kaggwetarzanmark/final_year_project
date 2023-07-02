const path = require("path");
const db = require("../routes/db_config");
const bcrypt = require("bcrypt");
const connection = db.createConnection();
const ejs = require("ejs");

function renderRegisterPage(req, res) {
  res.render('register', { flash: req.flash() });
}


// Handle the POST request for registration
async function registerUser(req, res) {
  try {
    const { user_type,name,username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const querySelect =
      "SELECT COUNT(*) AS count FROM users WHERE email = ? AND user_type = ?";
    const valuesSelect = [email, user_type];

    connection.query(querySelect, valuesSelect, (selectError, selectResults) => {
      if (selectError) {
        console.error("Error checking user:", selectError);
        req.flash("error", "Error registering user");
        res.redirect("/register");
      } else {
        const count = selectResults[0].count;

        if (count > 0) {
          // User with the same email and user_type already exists
          console.log("User already exists");
          req.flash("error", "User already exists");
          res.redirect("/register");
        } else {
          const queryInsert =
            "INSERT INTO users (user_type,name, username, password, email ) VALUES (?, ?, ?, ?, ?)";
          const valuesInsert = [user_type,name, username, hashedPassword,email ];

          connection.query(queryInsert, valuesInsert, (insertError, insertResults) => {
            if (insertError) {
              console.error("Error registering user:", insertError);
              req.flash("error", "Error registering user");
              res.redirect("/register");
            } else {
              console.log("User registered successfully");
              req.flash("success", "User registered successfully");
              res.redirect("/");
            }
          });
        }
      }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    req.flash("error", "Error registering user");
    res.redirect("/register");
  }
}




module.exports = {
  renderRegisterPage,
  registerUser,
};
