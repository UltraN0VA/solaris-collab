// routes/preAssessmentRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { admin, engineer } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  createPreAssessment,
  submitPaymentProof,
  cashPayment,
  verifyPayment,
  getAllPreAssessments,
  getMyPreAssessments,
  getPreAssessmentById,
  assignEngineer,
  deployDevice,
  retrieveDevice,
  generateReport,
  cancelPreAssessment,
  getPaymentHistory,
  getPreAssessmentStats
} = require('../controllers/preAssessmentControllers');

const { verifyToken } = authMiddleware;

// ============ CUSTOMER ROUTES ============
// IMPORTANT: Specific routes MUST come before /:id

// Payment history
router.get('/payments', verifyToken, getPaymentHistory);

// My bookings - for customer
router.get('/my-bookings', verifyToken, getMyPreAssessments);

// My assessments - ADD THIS ROUTE (for engineer dashboard)
router.get('/my-assessments', verifyToken, engineer, getMyPreAssessments);

// ============ ADMIN ROUTES ============
// Stats route - must come before /:id
router.get('/stats', verifyToken, admin, getPreAssessmentStats);

// Get all pre-assessments
router.get('/', verifyToken, admin, getAllPreAssessments);

// ============ DYNAMIC ROUTES (must be LAST) ============
// Get by ID - dynamic route
router.get('/:id', verifyToken, getPreAssessmentById);

// Create booking
router.post('/', verifyToken, createPreAssessment);

// Payment submission
router.post('/payment', verifyToken, upload.single('paymentProof'), submitPaymentProof);

// Cash payment
router.post('/cash-payment', verifyToken, cashPayment);

// Cancel booking
router.put('/:id/cancel', verifyToken, cancelPreAssessment);

// ============ ADMIN ROUTES (dynamic) ============
router.put('/:id/verify-payment', verifyToken, admin, verifyPayment);
router.put('/:id/assign-engineer', verifyToken, admin, assignEngineer);

// ============ ENGINEER ROUTES (dynamic) ============
router.post('/:id/deploy-device', verifyToken, engineer, deployDevice);
router.post('/:id/retrieve-device', verifyToken, engineer, retrieveDevice);
router.post('/:id/generate-report', verifyToken, engineer, generateReport);

module.exports = router;