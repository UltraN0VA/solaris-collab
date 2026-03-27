// routes/freeQuoteRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { admin, engineer } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const {
  createFreeQuote,
  getAllFreeQuotes,
  getMyFreeQuotes,
  getFreeQuoteById,
  updateQuoteStatus,
  uploadQuotation,
  cancelFreeQuote,
  getEngineerFreeQuotes,
  assignEngineerToFreeQuote  // Add this import
} = require('../controllers/freeQuoteControllers');

const { verifyToken } = authMiddleware;

// Customer routes
router.post('/', verifyToken, createFreeQuote);
router.get('/my-quotes', verifyToken, getMyFreeQuotes);
router.get('/:id', verifyToken, getFreeQuoteById);
router.put('/:id/cancel', verifyToken, cancelFreeQuote);

// Engineer routes
router.get('/engineer/my-quotes', verifyToken, engineer, getEngineerFreeQuotes);

// Admin routes
router.get('/', verifyToken, admin, getAllFreeQuotes);
router.put('/:id/status', verifyToken, admin, updateQuoteStatus);
router.put('/:id/assign-engineer', verifyToken, admin, assignEngineerToFreeQuote);  // Add this route
router.post('/:id/upload-quotation', verifyToken, admin, upload.single('quotation'), uploadQuotation);

module.exports = router;