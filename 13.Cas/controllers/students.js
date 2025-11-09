const Student = require('../models/Student');
const Grade = require('../models/Grade');

// --- Param middleware ---
exports.loadStudentById = async (req, res, next, id) => {
  try {
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    req.student = student;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
};

// --- CRUD operacije ---

// GET /students
exports.getAllStudents = async (req, res) => {
  const students = await Student.find();
  res.json(students);
};

// GET /students/:id
exports.getStudentById = (req, res) => {
  res.json(req.student);
};

// GET /students/:id/grades
exports.getStudentGrades = async (req, res) => {
  const grades = await Grade.find({ studentId: req.student._id });
  res.json({ student: req.student.name, grades });
};

// POST /students
exports.createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /students/:id
exports.updateStudent = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Student not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /students/:id
exports.deleteStudent = async (req, res) => {
  try {
    await req.student.deleteOne();
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// --- Dodatne rute sa :id ---

// GET /students/:id/status
exports.getStudentStatus = (req, res) => {
  res.json({
    name: req.student.name,
    active: req.student.isActive ? 'Aktivan' : 'Neaktivan',
  });
};

// PATCH /students/:id/activate
exports.activateStudent = async (req, res) => {
  req.student.isActive = true;
  await req.student.save();
  res.json({ message: 'Student aktiviran', student: req.student });
};

// PATCH /students/:id/deactivate
exports.deactivateStudent = async (req, res) => {
  req.student.isActive = false;
  await req.student.save();
  res.json({ message: 'Student deaktiviran', student: req.student });
};
