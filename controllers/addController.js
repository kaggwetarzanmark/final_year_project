const path = require('path');
function renderaddPage(req, res) {
  if (req.session.user && req.session.user.user_type === "Cashier") {
    res.render('add');
  } else {
    res.redirect("/");
  }
  }
  
  module.exports = {
    renderaddPage,
  };