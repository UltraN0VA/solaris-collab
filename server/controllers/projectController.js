// controllers/projectController.js
const Project = require('../models/Project');
const Client = require('../models/Clients');
const FreeQuote = require('../models/FreeQuote');
const PreAssessment = require('../models/PreAssessment');
const mongoose = require('mongoose');

// @desc    Get client's projects
// @route   GET /api/projects/my-projects
// @access  Private (Customer)
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const client = await Client.findOne({ userId });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const projects = await Project.find({ clientId: client._id })
      .populate('assignedEngineerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects
    });

  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
};

// @desc    Get all projects (Admin/Engineer)
// @route   GET /api/projects
// @access  Private (Admin, Engineer)
exports.getAllProjects = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const query = {};
    if (status) query.status = status;
    
    // If engineer, only show projects assigned to them
    if (userRole === 'engineer') {
      query.assignedEngineerId = userId;
    }

    const projects = await Project.find(query)
      .populate('clientId', 'contactFirstName contactLastName contactNumber')
      .populate('assignedEngineerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      projects,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
};
// controllers/projectController.js - Add function to create project from customer acceptance
exports.createProjectFromAcceptance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sourceType, sourceId } = req.body; // sourceType: 'free-quote' or 'pre-assessment'

    const client = await Client.findOne({ userId });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    let sourceData;
    let projectData = {};

    if (sourceType === 'free-quote') {
      sourceData = await FreeQuote.findById(sourceId).populate('addressId');
      if (!sourceData || sourceData.clientId.toString() !== client._id.toString()) {
        return res.status(404).json({ message: 'Free quote not found' });
      }
      
      projectData = {
        clientId: client._id,
        userId: client.userId,
        addressId: sourceData.addressId?._id,
        systemSize: sourceData.desiredCapacity || '5',
        systemType: 'grid-tie',
        totalCost: 0, // To be set by admin
        status: 'quoted',
        projectName: `${client.contactFirstName} ${client.contactLastName} - Solar Installation`,
        sourceType: 'free-quote',
        sourceId: sourceData._id
      };
    } else if (sourceType === 'pre-assessment') {
      sourceData = await PreAssessment.findById(sourceId).populate('addressId');
      if (!sourceData || sourceData.clientId.toString() !== client._id.toString()) {
        return res.status(404).json({ message: 'Pre-assessment not found' });
      }
      
      projectData = {
        clientId: client._id,
        userId: client.userId,
        addressId: sourceData.addressId._id,
        systemSize: sourceData.desiredCapacity || '5',
        systemType: sourceData.recommendedSystemType || 'grid-tie',
        totalCost: sourceData.finalSystemCost || 0,
        status: 'quoted',
        projectName: `${client.contactFirstName} ${client.contactLastName} - Solar Installation`,
        sourceType: 'pre-assessment',
        sourceId: sourceData._id,
        preAssessmentId: sourceData._id
      };
    } else {
      return res.status(400).json({ message: 'Invalid source type' });
    }

    const project = new Project(projectData);
    await project.save();

    // Update the source to mark as accepted
    if (sourceType === 'free-quote') {
      sourceData.status = 'accepted';
      await sourceData.save();
    } else {
      sourceData.assessmentStatus = 'project_created';
      await sourceData.save();
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });

  } catch (error) {
    console.error('Create project from acceptance error:', error);
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};
// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const project = await Project.findById(id)
      .populate('clientId', 'contactFirstName contactLastName contactNumber')
      .populate('assignedEngineerId', 'firstName lastName email')
      .populate('preAssessmentId')
      .populate('addressId');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    const client = await Client.findOne({ userId });
    if (userRole !== 'admin' && userRole !== 'engineer' && project.clientId._id.toString() !== client?._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({
      success: true,
      project
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Failed to fetch project', error: error.message });
  }
};

// @desc    Create new project (Admin)
// @route   POST /api/projects
// @access  Private (Admin)
exports.createProject = async (req, res) => {
  try {
    const { 
      clientId,
      userId,
      addressId,
      systemSize,
      systemType,
      totalCost,
      initialPayment,
      progressPayment,
      finalPayment,
      notes
    } = req.body;

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Create project name based on client name
    const projectName = `${client.contactFirstName} ${client.contactLastName} - Solar Installation`;

    // Create payment schedule
    const paymentSchedule = [];
    if (initialPayment > 0) {
      paymentSchedule.push({
        type: 'initial',
        amount: initialPayment,
        dueDate: new Date(),
        status: 'pending'
      });
    }
    if (progressPayment > 0) {
      paymentSchedule.push({
        type: 'progress',
        amount: progressPayment,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: 'pending'
      });
    }
    if (finalPayment > 0) {
      paymentSchedule.push({
        type: 'final',
        amount: finalPayment,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        status: 'pending'
      });
    }

    const project = new Project({
      clientId,
      userId,
      addressId,
      projectName,
      systemSize,
      systemType: systemType || 'grid-tie',
      totalCost,
      initialPayment: initialPayment || 0,
      progressPayment: progressPayment || 0,
      finalPayment: finalPayment || 0,
      paymentSchedule,
      status: 'quoted',
      notes,
      createdBy: req.user.id
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};

// @desc    Update project status
// @route   PUT /api/projects/:id/status
// @access  Private (Admin)
exports.updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.status = status;
    if (notes) project.internalNotes = notes;
    
    if (status === 'approved') {
      project.approvedAt = new Date();
      project.approvedBy = req.user.id;
    }

    await project.save();

    res.json({
      success: true,
      message: 'Project status updated successfully',
      project
    });

  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({ message: 'Failed to update project', error: error.message });
  }
};

// @desc    Assign engineer to project
// @route   PUT /api/projects/:id/assign-engineer
// @access  Private (Admin)
exports.assignEngineer = async (req, res) => {
  try {
    const { id } = req.params;
    const { engineerId, notes } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.assignedEngineerId = engineerId;
    if (notes) project.internalNotes = notes;

    await project.save();

    res.json({
      success: true,
      message: 'Engineer assigned successfully',
      project
    });

  } catch (error) {
    console.error('Assign engineer error:', error);
    res.status(500).json({ message: 'Failed to assign engineer', error: error.message });
  }
};

// @desc    Update project progress (Engineer)
// @route   PUT /api/projects/:id/progress
// @access  Private (Engineer)
exports.updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { installationNotes, sitePhotos, status } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (installationNotes) project.installationNotes = installationNotes;
    if (sitePhotos) project.sitePhotos = sitePhotos;
    if (status) project.status = status;

    await project.save();

    res.json({
      success: true,
      message: 'Project progress updated successfully',
      project
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Failed to update progress', error: error.message });
  }
};

// @desc    Get project stats for dashboard (Admin)
// @route   GET /api/projects/stats
// @access  Private (Admin)
exports.getProjectStats = async (req, res) => {
  try {
    const total = await Project.countDocuments();
    const quoted = await Project.countDocuments({ status: 'quoted' });
    const approved = await Project.countDocuments({ status: 'approved' });
    const inProgress = await Project.countDocuments({ status: 'in_progress' });
    const completed = await Project.countDocuments({ status: 'completed' });
    const cancelled = await Project.countDocuments({ status: 'cancelled' });

    const totalRevenue = await Project.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);

    res.json({
      success: true,
      stats: {
        total,
        quoted,
        approved,
        inProgress,
        completed,
        cancelled,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};