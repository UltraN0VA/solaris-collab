const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { admin, engineer } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware'); // Correct import
const { verifyToken } = authMiddleware;

const {
  getFiles,
  deleteFile,
  downloadFile,
  uploadProjectFile,
  uploadInvoiceFile,
  uploadContractFile
} = require('../controllers/fileController');

// ============ FILE MANAGEMENT ROUTES ============

// Get all files for a specific entity
router.get('/:relatedTo/:relatedId', verifyToken, getFiles);

// Download file with optional transformations
router.get('/:id/download', verifyToken, downloadFile);

// Delete file
router.delete('/:id', verifyToken, deleteFile);

// ============ PROJECT FILE UPLOADS ============
// Upload project document (admin & engineer only)
router.post(
  '/projects/:projectId/documents',
  verifyToken,
  admin,
  upload.single('document'),
  uploadProjectFile
);

// Upload multiple project documents
router.post(
  '/projects/:projectId/documents/multiple',
  verifyToken,
  admin,
  upload.array('documents', 10),
  uploadProjectFile
);

// ============ INVOICE UPLOADS ============
// Upload invoice (admin only)
router.post(
  '/invoices/:invoiceId',
  verifyToken,
  admin,
  upload.single('invoice'),
  uploadInvoiceFile
);

// ============ CONTRACT UPLOADS ============
// Upload contract (admin & engineer only)
router.post(
  '/contracts/:projectId',
  verifyToken,
  [admin, engineer],
  upload.single('contract'),
  uploadContractFile
);

module.exports = router;