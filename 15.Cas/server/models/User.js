const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

userSchema.pre('save', async function (next) {
  this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

userSchema.methods.sayHello = function () {
  return `Zdravo, ja sam ${this.name}`;
};

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
