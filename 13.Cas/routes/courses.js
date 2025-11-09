const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courses');

router.param('courseId', courseController.loadCourseById);
router.param('studentId', courseController.loadStudentById);

router.post('/', courseController.createCourse);

router.get('/', courseController.getAllCourses);
router.get('/:courseId', courseController.getCourseById);

router.put('/:courseId/add-student/:studentId', courseController.addStudentToCourse);
router.delete('/:courseId/remove-student/:studentId', courseController.removeStudentFromCourse);

module.exports = router;
