const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/grades');

router.get('/', gradeController.getAllGrades);
router.get('/:id', gradeController.getGradeById);
router.post('/', gradeController.createGrade);
router.put('/:id', gradeController.updateGrade);
router.patch('/:id', gradeController.partialUpdateGrade);
router.delete('/:id', gradeController.deleteGrade);

router.get('/student/:id', gradeController.getGradesByStudent);

module.exports = router;
