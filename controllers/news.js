const News = require('../models/news');
const { cloudinary } = require("../cloudinary");
const newsTicker = require('../middleware');
const request = require('request');
const cheerio = require('cheerio');


// get all news in the index
module.exports.index = async (req, res) => {
    try{
        const news = await News.find({}).populate('author');
        res.json({
            success: true,
            news: news,
            message: "Loaded all news"
          })
    } catch(err){
        console.log(err);
    }
    
}


// creating a new New
module.exports.createNew = async (req, res, next) => {
    try {
        console.log(req.files)
        const news = new News(req.body);
        news.tags = req.body.tagsInput.split(',');
        if (!req.files[0]){
            news.image = {url: 'https://res.cloudinary.com/mo3az/image/upload/v1647520361/ICGroup/main-bg_dc0fhq.jpg', filename: 'Default Image'};
        } else {
            news.image = {url: req.files[0].path, filename: req.files[0].filename };
        }
        news.author = req.body.userID;
        await news.save();
        res.json({
            success: true,
            news: news,
            message: "Successfully made a new news!"
          })
    } catch (err) {
        console.log(err);
    }
}

// updating Blog
// module.exports.updateBlog = async (req, res) => {
//     const { id } = req.params;
//     const blog = await Blog.findByIdAndUpdate(id, { ...req.body.blog });
//     const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
//     blog.images.push(...imgs);
//     await blog.save();
//     if (req.body.deleteImages) {
//         for (let filename of req.body.deleteImages) {
//             await cloudinary.uploader.destroy(filename);
//         }
//         await blog.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
//     }
//     req.flash('success', 'Successfully updated blog!');
//     res.redirect(`/blogs/${blog._id}`)
// }

// updating one new
module.exports.updateNew = async (req, res, next) => {
    try {
        console.log(req.body.deletedImage)
        if(!req.files[0]){
            let news = await News.findOneAndUpdate({ _id: req.params.id}, {
                $set: {
                    title: req.body.title,
                    tags: req.body.tagsInput.split(','),
                    content: req.body.content
                }
            });
            await news.save();
            res.status(200).json({
                success: true,
                news: news,
                message: "Successfully updated news!"
              })
        } else {
            let news = await News.findOneAndUpdate({ _id: req.params.id}, {
                $set: {
                    title: req.body.title,
                    tags: req.body.tagsInput.split(','),
                    image: {url: req.files[0].path, filename: req.files[0].filename},
                    content: req.body.content
                }
            });
            await news.save();
            await cloudinary.uploader.destroy(req.body.deletedImage, {invalidate: true, resource_type: "raw"},function(error,result) {
                console.log(result, error) });
            res.status(200).json({
                success: true,
                news: news,
                message: "Successfully updated news!"
              })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}

// deleting one news
module.exports.deleteNew = async (req, res, next) => {
    try {
        let deletedNew = await News.findOneAndDelete({ _id: req.params.id });
        if (deletedNew){
            await cloudinary.uploader.destroy(deletedNew.image.filename, {invalidate: true, resource_type: "raw"},function(error,result) {
                console.log(result, error) });
            console.log(deletedNew)
            res.status(200).json({
                success: true,
                message: "Successfully deleted news!"
              })
            }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
          })
    }
}

// showing one news
module.exports.showNew = async (req, res,) => {
    // const news = await news.findById(req.params.id).populate({
    //     path: 'reviews',
    //     populate: {
    //         path: 'author'
    //     }
    // }).populate('author');
    try{
        const news = await News.findById(req.params.id).populate('author');
        if (news){
            res.json({
                success: true,
                news: news,
                message: "News found"
              })
        } else {
            res.json({
                success: false,
                message: "New not found found"
              })  
        }
    } catch (err) {
        console.log(err)
        res.json({
            success: false,
            message: err
          })
    }
}

module.exports.tickerTape = async (req, res) => {
    /* eslint-disable no-unused-vars */
    /* eslint-disable max-len */



    // INVESTING_URL should not include a trailing slash
    // because some links returned by the article only
    // provides the path instead of the full url,
    // and the path starts with a trailing slash.
    const INVESTING_URL = 'https://sa.investing.com'; // "https://sa.investing.com" for arabic news, default is english: "https://www.investing.com"

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
            res.send(data);
            /* ----------------------- */
        } else {
            console.log(error, response.statusCode, html);
        }
    })
}