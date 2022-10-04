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
    // console.log(req.params)
    // const user = await User.findById(id);
    // if (user.userType != "Administrator") {
    //     // req.flash('error', 'You do not have permission to do that!');
    //     // return res.redirect(`/blogs/${id}`);
    //     console.log("you can't proceed")
    // }
    next();
}

// Verification for Token
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

// creating random String for auth and reset pass
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

// scraping news
module.exports.getNewsData = async () => {
    tickerNews.deleteMany({}, function (err) {
        console.log("Deleted old ticker news in DB");
    });
    // // english news
    await gotScraping.get('https://www.tradingview.com/news/?market=economic').then((result) => {
        if (result.statusCode == 200) {
            const $ = cheerio.load(result.body);
            articles = $('.cardLink-gaCYEutU').each(function(i, el) { // 'a[href*="/stocks/saudi-arabia-news/"]'
              title = $(el).find('.title-C9RvkKmg').html();
              link = $(el).attr('href');
              if (title && link) {
                if (link.slice(0, 4) == 'http') { // checks if link starts with http
                  const newTickerNews = new tickerNews({
                      title: title,
                      link: link,
                      languageOption: 'en'
                  });
                  // /* Storing data in database */
                  newTickerNews.save();
                } else {
                  const newTickerNews = new tickerNews({
                      title: title,
                      link: 'https://www.tradingview.com' + link,
                      languageOption: 'en'
                  });
                  // /* Storing data in database */
                  newTickerNews.save();
                }
              }
            });
            console.log('English Ticker News stored in DB')
            /* ----------------------- */
          } else {
            console.log(result.statusCode);
          }
        });
    // // arabic news
    await gotScraping.get('https://ar.tradingview.com/news/').then((result) => {
        if (result.statusCode == 200) {
          const $ = cheerio.load(result.body);
          articles = $('.cardLink-gaCYEutU').each(function(i, el) { // 'a[href*="/stocks/saudi-arabia-news/"]'
            title = $(el).find('.title-C9RvkKmg').html();
              link = $(el).attr('href');
            if (title && link) {
                if (link.slice(0, 4) == 'http') { // checks if link starts with http
                  const newTickerNews = new tickerNews({
                      title: title,
                      link: link,
                      languageOption: 'ar'
                  });
                  // /* Storing data in database */
                  console.log(newTickerNews)
                  newTickerNews.save();
                } else {
                  const newTickerNews = new tickerNews({
                      title: title,
                      languageOption: 'ar'
                  });          
                  // /* Storing data in database */
                  console.log(newTickerNews)
                  newTickerNews.save();
                }
              } else if (title) {
                  const newTickerNews = new tickerNews({
                      title: title,
                      languageOption: 'ar'
                  });
                  // /* Storing data in database */
                  console.log(newTickerNews)
                  newTickerNews.save();         
                }
          });
          console.log('Arabic Ticker News stored in DB')
          /* ----------------------- */
        } else {
          console.log(result.statusCode);
        }
      });
}