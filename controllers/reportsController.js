const path = require('path');
function renderReportsPage(req, res) {
  if (req.session.user && req.session.user.user_type === "Sales Manager") {
    res.render('reports');
  } else {
    res.redirect("/");
  }
  }
  
  module.exports = {
    renderReportsPage,
  };