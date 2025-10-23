const express = require('express');
const app = express();
const userRoutes = require('./routes/users');
const studentsRoutes = require('./routes/students');

app.use(express.json());

app.use('/users', userRoutes);

app.use('/students', studentsRoutes);

app.listen(3000);
