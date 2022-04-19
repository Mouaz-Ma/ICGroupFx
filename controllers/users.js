const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const async = require("async");
const {
  isLoggedIn,
  isAuthor,
  validateAnalysis,
  verifyToken,
  randString
} = require('../middleware');

// you need to add facebook and google here
module.exports.register = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      res.json({
        success: false,
        message: "email or password missing"
      })
    } else {
      const uniqueString = randString();
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        uniqueString: uniqueString,
        strategy: req.body.strategy
      });
      await newUser.save().then(() => {
        const token = jwt.sign(newUser.toJSON(), process.env.SECRETJWT, {
          expiresIn: 604800 // 1 week
        });
        const smtpTransport = nodemailer.createTransport({
          host: "icgroupsfx.com",
          port: 465,
          auth: {
            user: process.env.MAILUSER,
            pass: process.env.MAILPASS
          },
          secure: true
        });
        let mailOptions = {
          to: newUser.email,
          from: process.env.MAILUSER,
          subject: 'Verify new Account',
          text: 'Please click on the following link to verify your account: \n\n' +
            // add https to this and o the nuxt app home page and change the url
            'https://icgroup.herokuapp.com/users/verify/' + uniqueString + '\n\n'
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          if (err) {
            console.log(err);
          } else {
            res.json({
              success: true,
              token: token,
              message: "Your account has been saved"
            })
            console.log('mail sent');
            // req.flash('success', 'An e-mail has been sent to ' + newUser.email + ' with further instructions.');
          }
        });

      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Your account could not be saved. Error: ",
      err
    })
  }
}

// registerSocial end point
module.exports.registerSocial = async (req, res) => {
  try {
    if (!req.body.email || await User.findOne({
        email: req.body.email
      })) {
      res.json({
        success: false,
        message: "email is missing or user exist"
      })
    } else {
      let newUser = new User({
        username: req.body.username,
        email: req.body.email,
        strategy: req.body.strategy,
        isVerified: true
      }, (err) => {
        if (err) console.log(err);
      });
      await newUser.save().then(() => {
        res.json({
          success: true,
          message: "Your account has been saved",
          newUser: newUser
        })
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Your account could not be saved. Error: ",
      err
    })
  }
}

module.exports.getVerified = async (req, res) => {
  try {
    console.log(req.params)
    const userFound = await User.findById(req.params.id)
    const smtpTransport = nodemailer.createTransport({
      host: "icgroupsfx.com",
      port: 465,
      auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPASS
      },
      secure: true
    });
    const mailOptions = {
      to: userFound.email,
      from: process.env.MAILUSER,
      subject: 'Verify Account Request',
      text: 'Please click on the following link to verify your account: \n\n' +
        // add https to this and o the nuxt app home page and change the url
        'https://icgroup.herokuapp.com/users/verify/' + userFound.uniqueString + '\n\n'
    };
    smtpTransport.sendMail(mailOptions, function (err) {
      if (err) {
        console.log(err);
      } else {
        res.json({
          success: true,
          message: "Your account has been saved"
        })
        console.log('mail sent');
        // req.flash('success', 'An e-mail has been sent to ' + newUser.email + ' with further instructions.');
      }
    });
  } catch(err){
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Your account could not be saved. Error ",
      err
    })
  }
}

module.exports.emailVerify = async (req, res) => {
  const {
    uniqueString
  } = req.params;
  // check is there anyone with the same string
  const user = await User.findOne({
    uniqueString: uniqueString
  })
  if (user) {
    // if there is one verify them
    user.isVerified = true
    let token = jwt.sign(user.toJSON(), process.env.SECRETJWT, {
      expiresIn: 604800 // 1 week
    });
    await user.save()
    // redirect to login page
    res.json({
      success: true,
      token: token,
      message: "verified"
    })
  } else {
    res.status(500).json({
      success: false,
      message: "Error occured when verifing your account ",
    })
  }
}

// login
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
  try {
    let foundUser = await User.findOne({
      _id: req.decoded._id
    })

    if (foundUser) {
      if (req.body.name) foundUser.name = req.body.name;
      if (req.body.email) foundUser.email = req.body.email;
      if (req.body.password) foundUser.password = req.body.password;

      await foundUser.save();
      res.json({
        success: true,
        message: "Successfully updated"
      })
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}


// reset password
module.exports.requestReset = (req, res, next) => {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({
        email: req.body.email
      }, function (err, user) {
        if (!user || req.body.email === null || user.strategy != "local") {
          res.json({
            success: false,
            message: "No account with that email address exists."
          })
        } else {
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function (err) {
            done(err, token, user);
          });
        }
      });
    },
    function (token, user, done) {
      const smtpTransport = nodemailer.createTransport({
        host: "icgroupsfx.com",
        port: 465,
        auth: {
          user: process.env.MAILUSER,
          pass: process.env.MAILPASS
        },
      });
      const mailOptions = {
        to: user.email,
        from: process.env.MAILUSER,
        subject: 'Password Reset',
        // dont forget the https and the domain name for the front end 
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://icgroup.herokuapp.com/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        if (err){
          console.log(err)
        } else {
          res.json({
            success: true,
            message: 'An e-mail has been sent to ' + user.email + ' with further instructions.'
          })
          console.log('request reset mail sent')
        }
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.sendStatus(500);
  });
}

module.exports.passResetGet = (req, res) => {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function (err, user) {
    console.log(user.strategy)
    if (!user || user.strategy != "local") {
      res.json({
        success: false,
        message: 'Password reset token is invalid or has expired.'
      })
    }
    res.json({
      success: true,
      message: 'User Found',
      token: req.params.token
    })
  });
}

module.exports.passResetPost = (req, res) => {
  async.waterfall([
    function (done) {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function (err, user) {
        if (!user || user.strategy != "local") {
          res.json({
            success: false,
            message: 'Password reset token is invalid or has expired.'
          })
        } else {
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          user.save(function (err) {
            let token = jwt.sign(user.toJSON(), process.env.SECRETJWT, {
              expiresIn: 604800 // 1 week
            })
            let smtpTransport = nodemailer.createTransport({
              host: "icgroupsfx.com",
              port: 465,
              auth: {
                user: process.env.MAILUSER,
                pass: process.env.MAILPASS
              },
              secure: true
            });
            let mailOptions = {
              to: user.email,
              from: process.env.MAILUSER,
              subject: 'Your password has been changed',
              text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
              if (err) {
                console.log(err);
              } else {
                console.log("second email sent");
              }
            });
            res.json({
              success: true,
              message: "Authentication successful",
              token: token,
              email: user.email
            });
          });
        }
      })
    },
  ], function (err) {
    res.json({
      success: false,
      message: err,
    });
  });
}




module.exports.logout = (req, res) => {
  req.logout();
  // req.session.destroy();
  res.json({
    success: true,
    message: "Bye!"
  })
}


// user profile
module.exports.user = async (req, res) => {
  try {
    let foundUser = await User.findOne({
      _id: req.decoded._id
    });
    if (foundUser) {
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

module.exports.contact = (req, res) => {
  try {
    let investment = req.body.iniInvestment;
    let initialInvestment = '0';
    switch (investment) {
      case 1:
        initialInvestment = '100$';
        break;
      case 2:
        initialInvestment = '1000$';
        break;
      case 3:
        initialInvestment = '5000$';
        break;
      case 4:
        initialInvestment = '10,000$';
        break;
      case 5:
        initialInvestment = '50,000$';
        break;
      default:
        initialInvestment = '100$';
    }
    const smtpTransport = nodemailer.createTransport({
      host: "icgroupsfx.com",
      port: 465,
      auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPASS
      }
    });
    const mailOptions = {
      to: process.env.MAILUSER,
      from: req.body.email,
      subject: 'new inquiry from ' + req.body.name,
      text: 'telphone number: ' + req.body.phone + ' \n' + 'email: ' + req.body.email + ' \n' + 'Trading Type: ' + req.body.tradingType + ' \n' + 'Initial Investment:' + initialInvestment + ' \n' + req.body.description + ' \n'
    };
    smtpTransport.sendMail(mailOptions, function (err) {
      if (err) {
        console.log(err)
      } else {
        res.json({
          success: true,
          message: 'An e-mail has been sent'
        })
      }
    });
  } catch (err) {
    console.log(err)
    res.json({
      success: false,
      message: err,
    });
  }
}