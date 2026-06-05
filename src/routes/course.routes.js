const { Router } = require('express')
const c = require('../controllers/course.controller')
const { authenticate } = require('../middleware/auth.middleware')
const { requireRole } = require('../middleware/rbac.middleware')
const { ROLES } = require('../constants/roles.constants')
const router = Router()

router.use(authenticate)

// Courses
router.get('/',                    c.getCourses)
router.get('/:id',                 c.getCourse)
router.post('/',                   requireRole(ROLES.ORG_ADMIN, ROLES.INSTRUCTOR, ROLES.CONTENT_CREATOR), c.createCourse)
router.patch('/:id',               requireRole(ROLES.ORG_ADMIN, ROLES.INSTRUCTOR, ROLES.CONTENT_CREATOR), c.updateCourse)
router.patch('/:id/publish',       requireRole(ROLES.ORG_ADMIN, ROLES.INSTRUCTOR), c.publishCourse)
router.delete('/:id',              requireRole(ROLES.ORG_ADMIN, ROLES.INSTRUCTOR), c.deleteCourse)

// Modules
router.post('/:courseId/modules',                                requireRole(ROLES.INSTRUCTOR, ROLES.CONTENT_CREATOR, ROLES.ORG_ADMIN), c.createModule)
router.patch('/:courseId/modules/reorder',                       requireRole(ROLES.INSTRUCTOR, ROLES.CONTENT_CREATOR, ROLES.ORG_ADMIN), c.reorderModules)
router.patch('/:courseId/modules/:id',                           requireRole(ROLES.INSTRUCTOR, ROLES.CONTENT_CREATOR, ROLES.ORG_ADMIN), c.updateModule)
router.delete('/:courseId/modules/:id',                          requireRole(ROLES.INSTRUCTOR, ROLES.CONTENT_CREATOR, ROLES.ORG_ADMIN), c.deleteModule)

// Lessons
router.post('/:courseId/modules/:moduleId/lessons',              requireRole(ROLES.INSTRUCTOR, ROLES.CONTENT_CREATOR, ROLES.ORG_ADMIN), c.createLesson)
router.patch('/lessons/:id',                                     requireRole(ROLES.INSTRUCTOR, ROLES.CONTENT_CREATOR, ROLES.ORG_ADMIN), c.updateLesson)
router.delete('/lessons/:id',                                    requireRole(ROLES.INSTRUCTOR, ROLES.CONTENT_CREATOR, ROLES.ORG_ADMIN), c.deleteLesson)
router.post('/:courseId/lessons/:id/complete',                   requireRole(ROLES.LEARNER), c.markLessonComplete)

module.exports = router
