const File = require('../models/File');
const { deleteFile, getFileUrl } = require('../middleware/uploadMiddleware');

// @desc    Get all files for a specific entity
// @route   GET /api/files/:relatedTo/:relatedId
// @access  Private
exports.getFiles = async (req, res) => {
  try {
    const { relatedTo, relatedId } = req.params;
    const { fileType, page = 1, limit = 20 } = req.query;

    const query = { relatedTo, relatedId, isActive: true };
    if (fileType) query.fileType = fileType;

    const files = await File.find(query)
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await File.countDocuments(query);

    res.json({
      success: true,
      files,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Failed to fetch files', error: error.message });
  }
};

// @desc    Upload project file
// @route   POST /api/files/projects/:projectId/documents
// @access  Private (Admin/Engineer)
exports.uploadProjectFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = getFileUrl(req, req.file);

    const fileRecord = new File({
      filename: req.file.filename || req.file.originalname,
      originalName: req.file.originalname,
      fileType: 'project_document',
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      publicId: req.file.filename || req.file.public_id,
      uploadedBy: userId,
      userRole: userRole,
      relatedTo: 'project',
      relatedId: projectId,
      metadata: {
        description: req.body.description || '',
        category: req.body.category || 'general',
        storageType: req.file.path ? 'local' : 'cloudinary'
      }
    });

    await fileRecord.save();

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: fileRecord._id,
        url: fileRecord.url,
        originalName: fileRecord.originalName,
        size: fileRecord.size
      }
    });

  } catch (error) {
    console.error('Upload project file error:', error);
    if (req.file) {
      await deleteFile(req.file.path, req.file.filename);
    }
    res.status(500).json({ message: 'Failed to upload file', error: error.message });
  }
};

// @desc    Upload invoice file
// @route   POST /api/files/invoices/:invoiceId
// @access  Private (Admin)
exports.uploadInvoiceFile = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = getFileUrl(req, req.file);

    const fileRecord = new File({
      filename: req.file.filename || req.file.originalname,
      originalName: req.file.originalname,
      fileType: 'invoice',
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      publicId: req.file.filename || req.file.public_id,
      uploadedBy: userId,
      userRole: 'admin',
      relatedTo: 'invoice',
      relatedId: invoiceId,
      metadata: {
        invoiceNumber: req.body.invoiceNumber || '',
        storageType: req.file.path ? 'local' : 'cloudinary'
      }
    });

    await fileRecord.save();

    res.json({
      success: true,
      message: 'Invoice uploaded successfully',
      file: {
        id: fileRecord._id,
        url: fileRecord.url,
        originalName: fileRecord.originalName
      }
    });

  } catch (error) {
    console.error('Upload invoice error:', error);
    if (req.file) {
      await deleteFile(req.file.path, req.file.filename);
    }
    res.status(500).json({ message: 'Failed to upload invoice', error: error.message });
  }
};

// @desc    Upload contract file
// @route   POST /api/files/contracts/:projectId
// @access  Private (Admin/Engineer)
exports.uploadContractFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = getFileUrl(req, req.file);

    const fileRecord = new File({
      filename: req.file.filename || req.file.originalname,
      originalName: req.file.originalname,
      fileType: 'contract',
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: fileUrl,
      publicId: req.file.filename || req.file.public_id,
      uploadedBy: userId,
      userRole: userRole,
      relatedTo: 'project',
      relatedId: projectId,
      metadata: {
        contractType: req.body.contractType || 'installation',
        signedDate: req.body.signedDate || null,
        storageType: req.file.path ? 'local' : 'cloudinary'
      }
    });

    await fileRecord.save();

    res.json({
      success: true,
      message: 'Contract uploaded successfully',
      file: {
        id: fileRecord._id,
        url: fileRecord.url,
        originalName: fileRecord.originalName
      }
    });

  } catch (error) {
    console.error('Upload contract error:', error);
    if (req.file) {
      await deleteFile(req.file.path, req.file.filename);
    }
    res.status(500).json({ message: 'Failed to upload contract', error: error.message });
  }
};

// @desc    Delete a file
// @route   DELETE /api/files/:id
// @access  Private (Admin or file owner)
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check authorization
    if (userRole !== 'admin' && file.uploadedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this file' });
    }

    // Delete from storage
    await deleteFile(file.url, file.publicId);

    // Soft delete from database
    file.isActive = false;
    await file.save();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Failed to delete file', error: error.message });
  }
};

// @desc    Download file with optional transformations
// @route   GET /api/files/:id/download
// @access  Private
exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id);
    if (!file || !file.isActive) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({
      success: true,
      url: file.url,
      filename: file.originalName,
      mimeType: file.mimeType,
      size: file.size
    });

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ message: 'Failed to generate download URL', error: error.message });
  }
};