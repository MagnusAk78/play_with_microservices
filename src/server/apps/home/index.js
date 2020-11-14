const express = require('express');
const asyncHandler = require('express-async-handler');

function createHomeApp(logger, {User}) {
  const router = express.Router();

  router.route('/').get(asyncHandler(async function (req, res) {
    if(req.context.userId) {
      const user = await User.findOne({userId: req.context.userId}).exec();
      if(user && user.username) {
        res.render('home/templates/home', { username: user.username });
      } else {
        req.session = null;
        res.redirect('/');
      }
    } else {
      res.render('home/templates/home');
    }
  }));

  return {
    router,
  };
}

module.exports = createHomeApp;
