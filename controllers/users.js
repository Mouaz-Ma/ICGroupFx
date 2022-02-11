const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { isLoggedIn, isAuthor, validateAnalysis, verifyToken } = require('../middleware');

// you need to add facebook and google here
module.exports.register = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.json({
      success: false,
      message: "email or password missing"
    })
  } else {
    try {
      let newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      });
      await newUser.save();
      let token = jwt.sign(newUser.toJSON(), process.env.SECRETJWT, {
        expiresIn: 604800 // 1 week
      });
      res.json({
        success: true,
        token: token,
        message: "Your account has been saved"
      })
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Your account could not be saved. Error: ",
        err
      })
    }
}
}

// user profile or verify
module.exports.verify = async (req, res) => {
  try{
    let foundUser = await User.findOne({ _id: req.decoded._id});
    if (foundUser){
      res.json({
        success: true,
        user: foundUser
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

module.exports.login = async (req, res) => {
  try {
    const foundUser = await User.findOne({
      email: req.body.email
    });
    if (!foundUser || !req.body.password) {
      res.json({
        success: false,
        message: "User not found!"
      })
    } else {
      if (foundUser.comparePassword(req.body.password)) {
        let token = jwt.sign(foundUser.toJSON(), process.env.SECRETJWT, {
          expiresIn: 604800 // 1 week
        })
        res.json({
          success: true,
          message: "Authentication successful",
          token: token
        });
      } else {
        res.status(403).json({
          success: false,
          message: 'Authentication faild, Email or password wrong'
        })
      }
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}
// updating profile
module.exports.updateUser = async (req, res) => {
  try{
    let foundUser = await User.findOne({ _id: req.decoded._id})

    if(foundUser){
      if (req.body.name) foundUser.name = req.body.name;
      if (req.body.email) foundUser.email = req.body.email;
      if (req.body.password) foundUser.password = req.body.password;

      await foundUser.save();
      res.json({
        success: true,
        message: "Successfully updated"
      })
    }
  } catch (err){
    console.log(err);
    res.sendStatus(500);
  }
}



module.exports.logout = (req, res) => {
    req.logout();
    // req.session.destroy();
    req.flash('success', "Goodbye!");
    res.redirect('/');
}