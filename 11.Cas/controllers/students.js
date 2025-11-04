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

// filters: {
//  city: 'Novi%20Pazar'
// }

// GET /students?city=Novi%20Pazar
// GET /students?excludeCity=Beograd
// GET /students?minAge=18
// GET /students?olderThan=18
// GET /students?maxAge=18
// GET /students?youngerThan=18
// GET /students?cities=Beograd,Novi%20Sad
// GET /students?excludeCities=Beograd,Novi%20Sad
// GET /students?city=Novi%20Pazar&minAge=18
// GET /students?nameContains=an
async function getAllStudents(req, res) {
  const filters = {};

  if (req.query.city) filters.city = req.query.city;
  if (req.query.age) filters.age = +req.query.age;
  if (req.query.name) filters.name = req.query.name;
  // Isto kao:
  // if (req.query.city) filters.city = { $eq: req.query.city};
  // if (req.query.age) filters.age = { $eq: +req.query.age};
  // if (req.query.name) filters.name = { $eq: req.query.name};

  if (req.query.excludeCity) filters.city = { $ne: req.query.excludeCity };
  if (req.query.excludeAge) filters.age = { $ne: Number(req.query.excludeAge) };
  if (req.query.excludeName) filters.name = { $ne: req.query.excludeName };

  if (req.query.olderThan) filters.age = { $gt: +req.query.olderThan };
  if (req.query.youngerThan) filters.age = { $lt: +req.query.youngerThan };

  // if (req.query.minAge) filters.age = { $gte: +req.query.minAge };
  // if (req.query.maxAge) filters.age = { $lte: +req.query.maxAge };
  if (req.query.minAge || req.query.maxAge) {
    filters.age = {};
    if (req.query.minAge) filters.age.$gte = Number(req.query.minAge);
    if (req.query.maxAge) filters.age.$lte = Number(req.query.maxAge);
  }

  if (req.query.cities) filters.city = { $in: req.query.cities.split(',') };

  if (req.query.excludeCities)
    filters.city = { $nin: req.query.excludeCities.split(',') };

  if (req.query.nameContains)
    filters.name = { $regex: req.query.nameContains, $options: 'i' };

  const sortField = req.query.sortBy || 'age';
  const sortOrder = req.query.order === 'desc' ? -1 : 1;
  const limit = Number(req.query.limit) || 10;
  const skip = Number(req.query.skip) || 0;

  const students = await Student.find(filters)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limit);
    
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

// .replaceOne()

async function replaceStudent(req, res) {
  try {
    const updated = await Student.replaceOne({ _id: req.params.id }, req.body);
    if (updated.matchedCount === 0)
      return res.status(404).json({ message: 'Student nije pronadjen' });
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (err) {
    res
      .status(400)
      .json({ message: 'Greska pri azuriranju', error: err.message });
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
  replaceStudent,
  updateStudent,
  deleteStudent,
};
