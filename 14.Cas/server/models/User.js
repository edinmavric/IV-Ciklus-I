const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ime je obavezno.'],
  },
  email: {
    type: String,
    required: [true, 'Email je obavezan.'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Email nije u validnom formatu.'],
  },
  password: {
    type: String,
    required: [true, 'Lozinka je obavezna.'],
    validate: {
      validator: value => value.length >= 6,
      message: 'Lozinka mora imati najmanje 6 karaktera.',
    },
  },
  role: {
    type: String,
    enum: ['student', 'professor', 'admin'],
    default: 'student',
  },
});

module.exports = mongoose.model('User', userSchema);
