const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Student = require('../models/Student');

router.post('/', async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    const saved = await newCourse.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:courseId/add-student/:studentId', async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const course = await Course.findById(courseId);
    const student = await Student.findById(studentId);

    if (!student || !course)
      return res.status(404).json({ message: 'Not Found' });

    if (!course.students.includes(studentId)) course.students.push(studentId);
    if (!student.courses.includes(courseId)) student.courses.push(courseId);

    await course.save();
    await student.save();

    res.json({ message: 'Student dodat na kurs' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
