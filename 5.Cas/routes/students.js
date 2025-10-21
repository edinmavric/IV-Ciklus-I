const express = require('express');
const router = express.Router();
let students = require('../data');

router.get('/', (req, res) => {
  res.json(students);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const student = students.find(s => s.id === id);
  if (!student)
    return res.status(404).send(`Student sa id-jem "${id}" ne postoji!`);
  res.json(student);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  const newStudent = { id: students.length + 1, name };
  if (newStudent.name.length < 3)
    return res.status(400).send('Ime mora biti duze od 2 slova');
  students.push(newStudent);
  res.status(201).json(newStudent);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  students = students.filter(s => s.id !== id);
  res.sendStatus(204);
});

module.exports = router;
