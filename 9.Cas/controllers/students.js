const Student = require('../models/Student');

// .save() cuva podatke u bazi

async function createStudent(req, res) {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: 'Proverite podatke', error: err.message });
  }
}

// .find() vraca celu kolekciju

async function getAllStudents(req, res) {
  const students = await Student.find();
  res.json(students);
}

// .findById(req.params.id) vraca kolekciju po nekom id-u

async function getStudentById(req, res) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student)
      return res.status(404).json({ message: 'Student ne postoji' });
    res.json(student);
  } catch (err) {
    res
      .status(400)
      .json({ message: 'Format id-a nije ispravan', error: err.message });
  }
}

// .findByIdAndUpdate(req.params.id, req.body) nalazi po id i azurira objekat
// new: true, vraca azurirani objekat
// runValidators: true, vrsi provere iz seme iz pocetka

async function updateStudent(req, res) {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res.status(404).json({ message: 'Student nije pronadjen' });
    res.json(updated);
  } catch (err) {
    res
      .status(400)
      .json({ message: 'Greska pri azuriranju', error: err.message });
  }
}

// .findByIdAndDelete(req.params.id) nalazi objekat i brise ga

async function deleteStudent(req, res) {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: 'Student nije pronadjen' });
    res.json({ message: 'Student obrisan', deleted });
  } catch (err) {
    res
      .status(400)
      .json({ message: 'Greska pri brisanju', error: err.message });
  }
}

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
