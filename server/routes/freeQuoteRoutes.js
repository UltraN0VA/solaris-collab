const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { admin, engineer } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware'); // Use object destructuring


const {
  createFreeQuote,
  getAllFreeQuotes,
  getMyFreeQuotes,
  getFreeQuoteById,
  updateQuoteStatus,
  uploadQuotation,
  cancelFreeQuote,
  getEngineerFreeQuotes
} = require('../controllers/freeQuoteControllers');

// Extract verifyToken from authMiddleware
const { verifyToken } = authMiddleware;

// Customer routes
router.post('/', verifyToken, createFreeQuote);
router.get('/my-quotes', verifyToken, getMyFreeQuotes);
router.get('/:id', verifyToken, getFreeQuoteById);
router.put('/:id/cancel', verifyToken, cancelFreeQuote);
// ============ ENGINEER ROUTES ============
// IMPORTANT: This must come BEFORE the /:id route
router.get('/engineer/my-quotes', verifyToken, engineer, getEngineerFreeQuotes);

// Admin routes
router.get('/', verifyToken, admin, getAllFreeQuotes);
router.put('/:id/status', verifyToken, admin, updateQuoteStatus);
router.post('/:id/upload-quotation', verifyToken, admin, upload.single('quotation'), uploadQuotation);

module.exports = router;