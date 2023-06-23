const path = require('path');

function renderLoginPage(req, res) {
  res.render('login');
}


module.exports = {
  renderLoginPage,
  
};


