const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { admin, engineer } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { verifyToken } = authMiddleware;

const {
  createPreAssessment,
  submitPaymentProof,
  cashPayment,
  verifyPayment,
  getAllPreAssessments,
  getMyPreAssessments,
  getPreAssessmentById,
  assignEngineer,
  cancelPreAssessment,
  getPaymentHistory,
  getPreAssessmentStats,
  // Engineer functions
  getEngineerAssessments,
  updateSiteAssessment,
  uploadQuotationPDF,
  submitAssessmentReport,
  getAssessmentDocuments,
  addEngineerComment,
  getAssessmentComments,
  getIoTData,
  // Admin functions
  deployDevice,     // Admin only
  retrieveDevice    // Admin only
} = require('../controllers/preAssessmentControllers');

// ============ CUSTOMER ROUTES ============
router.get('/payments', verifyToken, getPaymentHistory);
router.get('/my-bookings', verifyToken, getMyPreAssessments);

// ============ ADMIN ROUTES ============
router.get('/stats', verifyToken, admin, getPreAssessmentStats);
router.get('/', verifyToken, admin, getAllPreAssessments);
router.put('/:id/verify-payment', verifyToken, admin, verifyPayment);
router.put('/:id/assign-engineer', verifyToken, admin, assignEngineer);

// ============ ENGINEER DEVICE FUNCTIONS ============
// Engineer deploys device on site
router.post('/:id/deploy-device', verifyToken, engineer, deployDevice);

// Engineer retrieves device after 7 days
router.post('/:id/retrieve-device', verifyToken, engineer, retrieveDevice);

// Engineer views IoT data
router.get('/:id/iot-data', verifyToken, engineer, getIoTData);

// ============ ENGINEER FUNCTIONS (Read-only for IoT data) ============
// Engineer views assigned assessments
router.get('/engineer/my-assessments', verifyToken, engineer, getEngineerAssessments);



// Engineer updates site assessment notes
router.put('/:id/update-assessment', verifyToken, engineer, updateSiteAssessment);

// Engineer uploads quotation
router.post('/:id/upload-quotation', verifyToken, engineer, upload.single('quotation'), uploadQuotationPDF);

// Engineer views documents
router.get('/:id/documents', verifyToken, getAssessmentDocuments);

// Engineer adds comments
router.post('/:id/add-comment', verifyToken, engineer, addEngineerComment);
router.get('/:id/comments', verifyToken, getAssessmentComments);

// ============ DYNAMIC ROUTES ============
router.get('/:id', verifyToken, getPreAssessmentById);
router.post('/', verifyToken, createPreAssessment);
router.put('/:id/cancel', verifyToken, cancelPreAssessment);

module.exports = router;