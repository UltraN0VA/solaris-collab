// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { admin, engineer } = require('../middleware/roleMiddleware');

const {
  getMyProjects,
  getAllProjects,
  getProjectById,
  createProject,
  updateProjectStatus,
  assignEngineer,
  updateProgress,
  getProjectStats,
  createProjectFromAcceptance  // <-- ADD THIS IMPORT
} = require('../controllers/projectController');

const { verifyToken } = authMiddleware;

// ============ CUSTOMER ROUTES ============
// Get my projects - must come before /:id
router.get('/my-projects', verifyToken, getMyProjects);

// Create project from acceptance (customer proceeds) - must come before /:id
router.post('/accept', verifyToken, createProjectFromAcceptance);  // <-- NOW THIS WORKS

// ============ ADMIN ROUTES ============
// Stats route - must come before /:id
router.get('/stats', verifyToken, admin, getProjectStats);

// Get all projects
router.get('/', verifyToken, admin, getAllProjects);

// Create project (admin)
router.post('/', verifyToken, admin, createProject);

// ============ DYNAMIC ROUTES (must be LAST) ============
// Get by ID
router.get('/:id', verifyToken, getProjectById);

// Update status
router.put('/:id/status', verifyToken, admin, updateProjectStatus);

// Assign engineer
router.put('/:id/assign-engineer', verifyToken, admin, assignEngineer);

// Update progress (Engineer)
router.put('/:id/progress', verifyToken, engineer, updateProgress);

module.exports = router;