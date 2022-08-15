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

module.exports.getNewsData = () => {
    /* eslint-disable no-unused-vars */
    /* eslint-disable max-len */
    const request = require('request');
    const cheerio = require('cheerio');

    // INVESTING_URL should not include a trailing slash
    // because some links returned by the article only
    // provides the path instead of the full url,
    // and the path starts with a trailing slash.
    const INVESTING_URL = 'https://www.investing.com'; // "https://sa.investing.com" for arabic news, default is english: "https://www.investing.com"

    const NEWS_URL = '/news/';

    const FOREX_NEWS_URL = 'forex-news';
    const COMMODITIES_NEWS_URL = 'commodities-news';
    const STOCK_MARKET_NEWS_URL = 'stock-market-news';
    const ECONOMIC_INDICATOR_NEWS_URL = 'economic-indicators';
    const ECONOMY_NEWS_URL = 'economy';
    const CRYPTO_CURRENCY_NEWS_URL = 'cryptocurrency-news';

    const data = [];
    newRequest = request.defaults({
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0',
        },
    });
    newRequest.get(INVESTING_URL + NEWS_URL + COMMODITIES_NEWS_URL, (error, response, html) => {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html); // loads the html document
            // get articles inside the container
            articles = $('.largeTitle article').each((i, el) => {
                title = $(el).find('article div a.title').html();
                link = $(el).find('article div a.title').attr('href');
                // some divs have null title, this will add only valid objects
                // to the array.
                if (title) {
                    // some anchors provide path to article instead
                    // of the full url.
                    if (link.slice(0, 4) == 'http') { // checks if link starts with http
                        data.push({
                            title: title,
                            link: link
                        });
                    } else {
                        data.push({
                            title: title,
                            link: INVESTING_URL + link
                        });
                    }
                }
            });
            /* Storing data in database */
            console.log(data);
            /* ----------------------- */
        } else {
            console.log(error, response.statusCode, html);
        }
    })
}