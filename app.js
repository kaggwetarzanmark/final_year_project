const cors = require('cors');
const express = require('express');
const app = express();
const port = 5000;
const ejs = require("ejs");
const path = require("path");
const routes = require("./routes/routes");
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const { router: authRoutes } = require("./routes/auth");
const { PythonShell } = require('python-shell');


app.set("view engine", "ejs");
app.use(cors());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes setup
app.use("/", routes);
app.use("/", authRoutes);
app.use(express.static(path.join(__dirname, "views")));

//model
const { PythonShell } = require('python-shell');

// Define the paths to the exported model files
const modelPath1 = 'models/linear_regression_model1.pkl';
const modelPath2 = 'models/linear_regression_model2.pkl';

// Define the Python script that loads and uses the models
const pythonScript = `
import pickle

# Load the first model
with open('${modelPath1}', 'rb') as file:
    model1 = pickle.load(file)

# Load the second model
with open('${modelPath2}', 'rb') as file:
    model2 = pickle.load(file)

# Use the models to make predictions
# ... (add your code here)

# Example: Print the first model's coefficients
print(model1.coef_)

# Example: Print the second model's coefficients
print(model2.coef_)
`;

// Execute the Python script
PythonShell.runString(pythonScript, null, function (err, result) {
  if (err) throw err;
  console.log(result);
});


// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode);
  res.json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
