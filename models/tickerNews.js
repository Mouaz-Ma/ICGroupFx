const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tickerNewsSchema = new Schema({
    title: String,
    link: String,
    languageOption: String,
});


module.exports = mongoose.model('tickerNews', tickerNewsSchema);