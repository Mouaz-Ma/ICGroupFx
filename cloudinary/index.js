const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ICGroup',
        resource_type: 'raw',
        allowedFormats: ['jpeg', 'png', 'jpg', 'mp3'],
    }
});

module.exports = {
    cloudinary,
    storage
}