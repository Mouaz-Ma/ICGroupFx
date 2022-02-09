const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { isLoggedIn, isAuthor, validateAnalysis, verifyToken } = require('../middleware');
const passport = require('passport');
const user = require('../models/user');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// you need to add facebook and google here
module.exports.register = async (req, res) => {
  if (!req.body.email || !req.body.password){
    res.json({success:false, message:"Your account could not be saved. Error: "}) 
  } else {
    Users=new User({email: req.body.email, username : req.body.username});
    await User.register(Users, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
          res.status(500).json({success:false, message:"Your account could not be saved. Error: ", err}) 
        }else{
          let token = jwt.sign(user.toJSON(), process.env.SECRETJWT, {
            expiresIn: 604800 // 1 week
          });
          res.json({success: true, token: token ,message: "Your account has been saved"})
        }
      });
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

module.exports.login = (req, res) => {
  if (!req.body.email) {
    res.json({
      success: false,
      message: "Email was not given"
    })
  } else {
    if (!req.body.password) {
      res.json({
        success: false,
        message: "Password was not given"
      })
    } else {
      try {
        const user = new User({
          email: req.body.email,
          password: req.body.password,
        });
        req.login(user, function (err) {
          if (err) {
            console.log(err)
            res.json({
              success: false,
              message: err
            })
          } else {
            passport.authenticate("local")(req, res,  function() {
                if (!user) {
                  console.log("couldn't find it ")
                  res.status(403).json({
                    success: false,
                    message: 'Authentication faild, User not found'
                  })
                } else {
                  console.log("token error")
                  const token = jwt.sign({
                    userId: user._id,
                    email: user.email
                  }, SECRETJWT, {
                    expiresIn: 604800
                  })
                  res.json({
                    success: true,
                    message: "Authentication successful",
                    token: token
                  });
                }
            });
          }
        })
      } catch (err) {
        console.log(err);
        res.sendStatus(500);
      }
    }
  }
}


module.exports.logout = (req, res) => {
    req.logout();
    // req.session.destroy();
    req.flash('success', "Goodbye!");
    res.redirect('/');
}