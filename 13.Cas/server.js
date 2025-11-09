require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const studentRoutes = require('./routes/students');
const gradeRoutes = require('./routes/grades');
const courseRoutes = require('./routes/courses');

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Povezan sa bazom'))
  .catch(() => console.error('Nije povezan sa bazom'));

app.use('/students', studentRoutes);
app.use('/grades', gradeRoutes);
app.use('/courses', courseRoutes);

app.listen(3000);
