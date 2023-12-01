const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: String,
  contentType: String,
  size: Number,
  data: Buffer,
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;