const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const passportLocalMongoose = require('passport-local-mongoose');

const ImageSchema = new Schema({
    url: String,
    filename: String
});
const bcrypt = require('bcrypt');

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

// const opts = { toJSON: { virtuals: true } };

const AffiliateSchema = new Schema({
    affiliateReferance: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    uniqueString: {
        type: String
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    image: ImageSchema,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    userType: String,
    isVerified: {type: Boolean, default: false},
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

AffiliateSchema.pre('save', function (next) {
    let user = this;
    if ((this.isModified('password') || this.isNew) && this.strategy === "local") {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err)
            }
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    return next(err);
                } else {
                    user.password = hash;
                    next();
                }
            })
        })
    } else {
        return next();
    }
})

AffiliateSchema.methods.comparePassword = function(password, next){
    let user = this;
    return bcrypt.compareSync(password, user.password);
}

module.exports = mongoose.model('Affiliate', AffiliateSchema);