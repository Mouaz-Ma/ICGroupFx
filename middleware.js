const { blogSchema, analysisSchema,reviewSchema } = require('./schema.js');
const ExpressError = require('./utils/ExpressError');
// const Blog = require('./models/blog');
// const Analysis = require('./models/analysis');
// const Review = require('./models/review');
const tickerNews = require('./models/tickerNews');
const jwt = require('jsonwebtoken');
const { gotScraping } = require('got-scraping');
const cheerio = require('cheerio');



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
    // INVESTING_URL should not include a trailing slash
    // because some links returned by the article only
    // provides the path instead of the full url,
    // and the path starts with a trailing slash.
    // const INVESTING_URL = 'https://sa.investing.com'; // "https://sa.investing.com" for arabic news, default is english: "https://www.investing.com"
    const NEWS_URL = '/news/';
    // const FOREX_NEWS_URL = 'forex-news';
    // const COMMODITIES_NEWS_URL = 'commodities-news';
    // const STOCK_MARKET_NEWS_URL = 'stock-market-news';
    // const ECONOMIC_INDICATOR_NEWS_URL = 'economic-indicators';
    // const ECONOMY_NEWS_URL = 'economy';
    // const CRYPTO_CURRENCY_NEWS_URL = 'cryptocurrency-news';
    tickerNews.deleteMany({}, function (err) {
        console.log("success");
    });

    const options1 = {
        url: 'https://sa.investing.com' + NEWS_URL,
        headerGeneratorOptions: {
            browsers: [{
                name: 'chrome',
                minVersion: 87,
                maxVersion: 89
            }],
            devices: ['desktop'],
            locales: ['ar-AR', 'en-US'],
            operatingSystems: ['windows', 'linux'],
        }
    }

    const options2 = {
        url: 'https://www.investing.com' + NEWS_URL,
        headerGeneratorOptions: {
            browsers: [{
                name: 'chrome',
                minVersion: 87,
                maxVersion: 89
            }],
            devices: ['desktop'],
            locales: ['ar-AR', 'en-US'],
            operatingSystems: ['windows', 'linux'],
        }
    }

    gotScraping(options1).then(result => {
        if (result.statusCode == 200) {
            const $ = cheerio.load(result.body); // loads the html document
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
                        const newTickerNews = new tickerNews({
                            title: title,
                            link: link,
                            languageOption: 'ar'
                        });
                        newTickerNews.save();
                    } else {
                        const newTickerNews = new tickerNews({
                            title: title,
                            link: options1.url + link,
                            languageOption: 'ar'
                        });
                        newTickerNews.save();
                    }
                }
            });
            /* Storing data in database */
            console.log('retived data')
            /* ----------------------- */
        } else {
            return result.statusCode
        }
    })

    gotScraping(options2).then(result => {
        if (result.statusCode == 200) {
            const $ = cheerio.load(result.body); // loads the html document
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
                        const newTickerNews = new tickerNews({
                            title: title,
                            link: link,
                            languageOption: 'en'
                        });
                        newTickerNews.save();
                    } else {
                        const newTickerNews = new tickerNews({
                            title: title,
                            link: options2.url + link,
                            languageOption: 'en'
                        });
                        newTickerNews.save();
                    }
                }
            });
            /* Storing data in database */
            console.log('retived data')
            /* ----------------------- */
        } else {
            return result.statusCode
        }
    })
}