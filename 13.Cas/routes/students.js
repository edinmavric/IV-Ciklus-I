const express = require('express');
const router = express.Router();
const studentController = require('../controllers/students');

// Param middleware
router.param('id', studentController.loadStudentById);

// CRUD
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', studentController.createStudent);
router.patch('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

// Dodatne rute sa :id
router.get('/:id/grades', studentController.getStudentGrades);
router.get('/:id/status', studentController.getStudentStatus);
router.patch('/:id/activate', studentController.activateStudent);
router.patch('/:id/deactivate', studentController.deactivateStudent);

module.exports = router;
