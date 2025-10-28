const mongoose = require('mongoose');

const studentScheme = new mongoose.Schema({
  name: String,
  age: Number,
  city: String
})

module.exports = mongoose.model('Student', studentScheme)
