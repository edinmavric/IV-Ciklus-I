const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ime je obavezno'],
    minLength: [2, 'Ime mora imati barem 2 karaktera'],
    maxLength: [50, 'Ime može imati najviše 50 karaktera'],
    trim: true,
  },
  city: {
    type: String,
    enum: {
      values: ['Beograd', 'Novi Sad', 'Niš', 'Subotica', 'Novi Pazar'],
      message:
        'Grad mora biti jedan od: Beograd, Novi Sad, Niš, Subotica, Novi Pazar',
    },
  },
  email: {
    type: String,
    required: [true, 'Email je obavezan'],
    lowercase: true,
    unique: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Neispravan format email-a'],
  },
  age: {
    type: Number,
    min: [15, 'Minimalne godine su 15'],
    max: [100, 'Previše godina (max 100)'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Student', studentSchema);
