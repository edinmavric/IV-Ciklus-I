const Grade = require('../models/Grade');
const Student = require('../models/Student');

// GET /grades - sve ocene
exports.getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.find().populate('student', 'name city');
    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /grades/:id - pojedina ocena
exports.getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id).populate(
      'student',
      'name city'
    );
    if (!grade)
      return res.status(404).json({ message: 'Ocena nije pronađena' });
    res.json(grade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /grades - dodaj ocenu
exports.createGrade = async (req, res) => {
  try {
    const { value, subject, student } = req.body;
    const studentExists = await Student.findById(student);
    if (!studentExists)
      return res.status(404).json({ message: 'Student ne postoji' });

    const grade = await Grade.create({ value, subject, student });
    res.status(201).json(grade);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /grades/:id - ažuriraj samo deo podataka
exports.partialUpdateGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!grade)
      return res.status(404).json({ message: 'Ocena nije pronađena' });
    res.json(grade);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /grades/:id - obriši ocenu
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade)
      return res.status(404).json({ message: 'Ocena nije pronađena' });
    res.json({ message: 'Ocena uspešno obrisana' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /students/:id/grades - sve ocene za određenog studenta
exports.getGradesByStudent = async (req, res) => {
  try {
    const grades = await Grade.find({ student: req.params.id });
    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
