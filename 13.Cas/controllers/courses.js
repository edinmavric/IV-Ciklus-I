const Course = require('../models/Course');
const Student = require('../models/Student');

exports.loadCourseById = async (req, res, next, id) => {
  try {
    const course = await Course.findById(id).populate('students', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    req.course = course;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid course ID format' });
  }
};

exports.loadStudentById = async (req, res, next, id) => {
  try {
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    req.student = student;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid student ID format' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    const saved = await course.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  const courses = await Course.find().populate('students', 'name');
  res.json(courses);
};

exports.getCourseById = (req, res) => {
  res.json(req.course);
};

exports.addStudentToCourse = async (req, res) => {
  try {
    const course = req.course;
    const student = req.student;

    if (!course.students.includes(student._id))
      course.students.push(student._id);
    if (!student.courses.includes(course._id)) student.courses.push(course._id);

    await course.save();
    await student.save();

    res.json({ message: 'Student dodat na kurs', course, student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeStudentFromCourse = async (req, res) => {
  try {
    const course = req.course;
    const student = req.student;

    course.students = course.students.filter(
      id => id.toString() !== student._id.toString()
    );
    student.courses = student.courses.filter(
      id => id.toString() !== course._id.toString()
    );

    await course.save();
    await student.save();

    res.json({ message: 'Student uklonjen sa kursa' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
