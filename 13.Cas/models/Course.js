const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Naziv kursa je obavezan'],
    minLength: [3, 'Naziv mora imati barem 3 karaktera']
  },
  description: {
    type: String,
    maxLength: [200, 'Opis može imati najviše 200 karaktera']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', courseSchema);
