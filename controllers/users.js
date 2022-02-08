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
    // req.flash('success', 'welcome back!');
    // const redirectUrl = req.session.returnTo || '/';
    // delete req.session.returnTo;
    // res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    // req.session.destroy();
    req.flash('success', "Goodbye!");
    res.redirect('/');
}