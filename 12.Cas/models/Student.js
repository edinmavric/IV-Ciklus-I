const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  city: String,
  age: Number,
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
});

module.exports = mongoose.model('Student', studentSchema);

// Relacija Kurs N - M Student
