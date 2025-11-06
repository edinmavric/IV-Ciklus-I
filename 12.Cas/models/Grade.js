const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  subject: String,
  value: Number,
});

module.exports = mongoose.model('Grade', gradeSchema);

// Relacija Student 1 - N Ocena
