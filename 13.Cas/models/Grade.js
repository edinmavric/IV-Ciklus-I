const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: [true, 'Ocena je obavezna'],
    min: [5, 'Najmanja ocena je 5'],
    max: [10, 'Najveća ocena je 10'],
  },
  subject: {
    type: String,
    required: [true, 'Predmet je obavezan'],
    trim: true,
    minlength: [2, 'Naziv predmeta mora imati bar 2 slova'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Ocena mora biti povezana sa studentom'],
  },
});

module.exports = mongoose.model('Grade', gradeSchema);
