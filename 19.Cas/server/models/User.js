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
    match: [/^\S+@\S+\.\S+$/, 'Email nije validan.'],
  },
  password: {
    type: String,
    required: [true, 'Lozinka je obavezna.'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['student', 'professor', 'admin'],
    default: 'student',
  },
  refreshToken: {
    type: String,
    default: null,
  },
});

// Format ime
userSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
  next();
});

// Hash lozinke
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Poređenje lozinke
userSchema.methods.comparePassword = function (pass) {
  return bcrypt.compare(pass, this.password);
};

export default mongoose.model('User', userSchema);
