require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student');

const app = express();
app.use(express.json());

mongoose
  .connect(
    process.env.MONGO_URI
  )
  .then(() => console.log('Povezan sa bazom'))
  .catch(() => console.error('Nije povezan sa bazom'));

// .save() cuva podatke u bazi

app.post('/students', async (req, res) => {
  const { name, age, city } = req.body;
  try {
    const student = new Student({ name, age, city });
    await student.save();
    res.status(201).json(student)
  } catch (err) {
    res.status(500).json({ message: 'Greska pri kreiranju podataka' });
  }
});

// .find() vraca celu kolekciju

app.get('/students', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.listen(3000);
