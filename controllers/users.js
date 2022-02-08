const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}
// you need to add facebook and google here
module.exports.register = async (req, res, next) => {
        Users=new User({email: req.body.email, username : req.body.username});
        User.register(Users, req.body.password, function(err, user) {
            if (err) {
                console.log(err);
              res.json({success:false, message:"Your account could not be saved. Error: ", err}) 
            }else{
                console.log(User)
              res.json({success: true, message: "Your account has been saved"})
            }
          });
}

module.exports.renderLogin = (req, res) => {
    // res.render('users/login');
    res.send("ok renderd")
}

module.exports.login = (req, res) => {
    if(!req.body.username){
        res.json({success: false, message: "Username was not given"})
      } else {
        if(!req.body.password){
          res.json({success: false, message: "Password was not given"})
        }else{
          passport.authenticate('local', function (err, user, info) { 
             if(err){
               res.json({success: false, message: err})
             } else{
              if (! user) {
                res.json({success: false, message: 'username or password incorrect'})
              } else{
                req.login(user, function(err){
                  if(err){
                    res.json({success: false, message: err})
                  }else{
                    const token =  jwt.sign({userId : user._id, 
                       username:user.username}, secretkey, 
                          {expiresIn: '24h'})
                    res.json({success:true, message:"Authentication successful", token: token });
                  }
                })
              }
             }
          })(req, res);
        }
      }
}

module.exports.logout = (req, res) => {
    req.logout();
    // req.session.destroy();
    req.flash('success', "Goodbye!");
    res.redirect('/');
}