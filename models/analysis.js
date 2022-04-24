const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String,
    public_id: String
});

const RecordingSchema = new Schema({
    url: String,
    filename: String,
    public_id: String,
    originalname: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const AnalysisSchema = new Schema({
    title: String,
    image: ImageSchema,
    audio: RecordingSchema,
    tags: [{type: String}],
    content: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    category: {type: Schema.Types.ObjectId, ref: "analysisCategory"}
}, { timestamps: true }, opts);


AnalysisSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/Analysis/${this._id}">${this.title}</a><strong>
    <p>${this.content.substring(0, 20)}...</p>`
});



AnalysisSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Analysis', AnalysisSchema);