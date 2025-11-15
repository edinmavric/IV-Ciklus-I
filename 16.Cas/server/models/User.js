import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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

// Formatiranje imena
userSchema.pre('save', function (next) {
  this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  next();
});

// Hash lozinke
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Metoda za poređenje lozinke
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
