const { blogSchema, analysisSchema,reviewSchema } = require('./schema.js');
const ExpressError = require('./utils/ExpressError');
const Blog = require('./models/blog');
const Analysis = require('./models/analysis');
const Review = require('./models/review');
const jwt = require('jsonwebtoken');

// module.exports.isLoggedIn = (req, res, next) => {
//     if (!req.isAuthenticated()) {
//         req.session.returnTo = req.originalUrl
//         req.flash('error', 'You must be signed in first!');
//         return res.redirect('/login');
//     }
//     next();
// }

// module.exports.validateBlog = (req, res, next) => {
//     const { error } = blogSchema.validate(req.body);
//     console.log(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }

// module.exports.validateAnalysis = (req, res, next) => {
//     const { error } = analysisSchema.validate(req.body);
//     console.log(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }

// module.exports.validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }

// module.exports.isBlogAuthor = async (req, res, next) => {
//     const { id } = req.params;
//     const blog = await Blog.findById(id);
//     if (!blog.author.equals(req.user._id)) {
//         req.flash('error', 'You do not have permission to do that!');
//         return res.redirect(`/blogs/${id}`);
//     }
//     next();
// }

// module.exports.isAnalysisAuthor = async (req, res, next) => {
//     const { id } = req.params;
//     const analysis = await Analysis.findById(id);
//     if (!analysis.author.equals(req.user._id)) {
//         req.flash('error', 'You do not have permission to do that!');
//         return res.redirect(`/analysiss/${id}`);
//     }
//     next();
// }

module.exports.isAdministrator = async (req, res, next) => {
    // const { id } = req.params.user.id;
    console.log(req.params)
    // const user = await User.findById(id);
    // if (user.userType != "Administrator") {
    //     // req.flash('error', 'You do not have permission to do that!');
    //     // return res.redirect(`/blogs/${id}`);
    //     console.log("you can't proceed")
    // }
    next();
}

module.exports.verifyToken = async (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    let checkBearer = "Bearer "

    if (token) {
        if (token.startsWith(checkBearer)) {
            token = token.slice(checkBearer.length, token.length);
        }
        jwt.verify(token, process.env.SECRETJWT, (err, decoded) => {
            if (err) {
                res.json({
                    success: false,
                    message: "Failed to authenticate"
                })
            } else {
                req.decoded = decoded;
                next()
            }
        })
    } else {
        res.json({
            success: false,
            message: "No token Provided"
        })
    }
}

module.exports.randString = () => {
    // 8 length string
    const len = 8
    let randStr = ''
    for (let i = 0 ; i < len ; i++ ){
        // ch = a number between 1 to 10 
        const ch = Math.floor((Math.random() * 10 ) + 1)
        randStr += ch
    }
    return randStr
  }
