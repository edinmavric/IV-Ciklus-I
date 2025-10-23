const express = require('express');
const router = express.Router();
let students = require('../data');
const validateStudent = require('../middleware/validateStudent');

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

router.post('/', validateStudent, (req, res) => {
  const { name, age, city } = req.body;
  const newStudent = { id: students.length + 1, name, age, city };

  students.push(newStudent);
  res.status(201).json(newStudent);
});

router.put('/:id', validateStudent, (req, res) => {
  const id = req.params.id;
  const index = students.findIndex(s => s.id == id);
  if (index === -1)
    return res.status(404).send('Student sa ovim id-jem ne postoji!');

  const { name, age, city } = req.body;

  students[index] = { id, name, age, city };
  // za ovo bi koristili find metodu, ne findIndex
  // student.name = name
  // student.age = age
  // student.city = city
  // // student.name
  // // student[index]

  res.json(students[index]);
});

router.patch('/:id', validateStudent, (req, res) => {
  const id = req.params.id;
  const student = students.find(s => s.id == id);

  if (!student) return res.status(404).send('Student sa id-jem nije pronadjen');

  const { name, age, city } = req.body;

  if (name) student.name = name;
  if (age) student.age = age;
  if (city) student.city = city;

  res.json(student);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  students = students.filter(s => s.id !== id);
  res.sendStatus(204);
});

module.exports = router;
