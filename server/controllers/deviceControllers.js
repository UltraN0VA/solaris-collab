const IoTDevice = require('../models/IoTDevice');
const PreAssessment = require('../models/PreAssessment');
const User = require('../models/Users');

// Helper function to generate unique device ID
const generateDeviceId = async () => {
  try {
    const prefix = 'IOT';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    console.log('Generating device ID...');
    
    // Find the latest device to get the next number
    const latestDevice = await IoTDevice.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    
    if (latestDevice && latestDevice.deviceId) {
      console.log('Latest device ID:', latestDevice.deviceId);
      const parts = latestDevice.deviceId.split('-');
      if (parts.length === 3) {
        const lastNumber = parseInt(parts[2]);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
    }
    
    const number = String(nextNumber).padStart(4, '0');
    const deviceId = `${prefix}-${year}${month}${day}-${number}`;
    console.log('Generated device ID:', deviceId);
    return deviceId;
  } catch (error) {
    console.error('Error generating device ID:', error);
    return `IOT-${Date.now()}`;
  }
};

// @desc    Get all devices
// @route   GET /api/admin/devices
// @access  Private (Admin)
exports.getAllDevices = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status && status !== 'all') query.status = status;

    const devices = await IoTDevice.find(query)
      .populate('assignedToEngineerId', 'name email')
      .populate('assignedToPreAssessmentId', 'bookingReference clientId assessmentStatus')
      .populate('deployedBy', 'name email')
      .populate('retrievedBy', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await IoTDevice.countDocuments(query);

    res.json({
      success: true,
      devices,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get all devices error:', error);
    res.status(500).json({ message: 'Failed to fetch devices', error: error.message });
  }
};

// @desc    Get device by ID
// @route   GET /api/admin/devices/:id
// @access  Private (Admin)
exports.getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await IoTDevice.findById(id)
      .populate('assignedToEngineerId', 'name email')
      .populate('assignedToPreAssessmentId', 'bookingReference clientId assessmentStatus')
      .populate('deployedBy', 'name email')
      .populate('retrievedBy', 'name email')
      .populate('assignedBy', 'name email')
      .populate('maintenanceHistory.performedBy', 'name email')
      .populate('deploymentHistory.assignedBy', 'name email')
      .populate('deploymentHistory.deployedBy', 'name email')
      .populate('deploymentHistory.retrievedBy', 'name email');

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json({
      success: true,
      device
    });

  } catch (error) {
    console.error('Get device by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch device', error: error.message });
  }
};

// @desc    Create new device
// @route   POST /api/admin/devices
// @access  Private (Admin)
exports.createDevice = async (req, res) => {
  try {
    console.log('Create device request body:', req.body);
    
    const { deviceName, model, manufacturer, serialNumber, firmwareVersion } = req.body;

    if (!deviceName || !model) {
      return res.status(400).json({ 
        success: false, 
        message: 'Device name and model are required' 
      });
    }

    const deviceId = await generateDeviceId();
    console.log('Using device ID:', deviceId);

    const deviceData = {
      deviceId: deviceId,
      deviceName: deviceName,
      model: model,
      manufacturer: manufacturer || 'Salfer Engineering',
      serialNumber: serialNumber || undefined,
      firmwareVersion: firmwareVersion || '1.0.0',
      status: 'available',
      batteryLevel: 100,
      lastHeartbeat: new Date(),
      deploymentHistory: [],
      maintenanceHistory: [],
      alerts: []
    };
    
    console.log('Creating device with data:', deviceData);
    
    const device = new IoTDevice(deviceData);
    await device.save();
    
    console.log('Device saved successfully');

    res.status(201).json({
      success: true,
      message: 'Device created successfully',
      device
    });

  } catch (error) {
    console.error('Create device error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Device with this ${field} already exists`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create device', 
      error: error.message 
    });
  }
};

// @desc    Update device
// @route   PUT /api/admin/devices/:id
// @access  Private (Admin)
exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { deviceName, model, manufacturer, serialNumber, firmwareVersion, status } = req.body;

    const device = await IoTDevice.findById(id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    if (deviceName) device.deviceName = deviceName;
    if (model) device.model = model;
    if (manufacturer) device.manufacturer = manufacturer;
    if (serialNumber) device.serialNumber = serialNumber;
    if (firmwareVersion) device.firmwareVersion = firmwareVersion;
    if (status) device.status = status;

    await device.save();

    res.json({
      success: true,
      message: 'Device updated successfully',
      device
    });

  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({ message: 'Failed to update device', error: error.message });
  }
};

// @desc    Delete device
// @route   DELETE /api/admin/devices/:id
// @access  Private (Admin)
exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await IoTDevice.findById(id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    if (device.status === 'deployed' || device.status === 'assigned' || device.status === 'data_collecting') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete a device that is assigned, deployed, or collecting data. Please retrieve it first.' 
      });
    }

    await device.deleteOne();

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });

  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({ message: 'Failed to delete device', error: error.message });
  }
};

// @desc    Get device stats for dashboard
// @route   GET /api/admin/devices/stats
// @access  Private (Admin)
exports.getDeviceStats = async (req, res) => {
  try {
    const total = await IoTDevice.countDocuments();
    const available = await IoTDevice.countDocuments({ status: 'available' });
    const assigned = await IoTDevice.countDocuments({ status: 'assigned' });
    const deployed = await IoTDevice.countDocuments({ status: 'deployed' });
    const dataCollecting = await IoTDevice.countDocuments({ status: 'data_collecting' });
    const maintenance = await IoTDevice.countDocuments({ status: 'maintenance' });
    const retired = await IoTDevice.countDocuments({ status: 'retired' });
    
    const lowBattery = await IoTDevice.countDocuments({ 
      batteryLevel: { $lt: 20 },
      status: { $nin: ['retired'] }
    });
    
    const offline = await IoTDevice.countDocuments({
      lastHeartbeat: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      status: { $nin: ['retired'] }
    });

    res.json({
      success: true,
      stats: {
        total,
        available,
        assigned,
        deployed,
        dataCollecting,
        maintenance,
        retired,
        lowBattery,
        offline
      }
    });

  } catch (error) {
    console.error('Get device stats error:', error);
    res.status(500).json({ message: 'Failed to fetch device stats', error: error.message });
  }
};

// @desc    Assign device to engineer for pre-assessment (Admin only)
// @route   POST /api/admin/devices/:deviceId/assign
// @access  Private (Admin)
exports.assignDeviceToEngineer = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { engineerId, preAssessmentId, notes } = req.body;
    const adminId = req.user.id;

    console.log('Assign device request:', { deviceId, engineerId, preAssessmentId, adminId });

    const device = await IoTDevice.findById(deviceId);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    if (device.status !== 'available') {
      return res.status(400).json({ 
        message: `Device is not available. Current status: ${device.status}` 
      });
    }

    const assessment = await PreAssessment.findById(preAssessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Pre-assessment not found' });
    }

    if (assessment.paymentStatus !== 'paid') {
      return res.status(400).json({ 
        message: `Cannot assign device. Payment status: ${assessment.paymentStatus}` 
      });
    }

    const engineer = await User.findById(engineerId);
    if (!engineer || engineer.role !== 'engineer') {
      return res.status(400).json({ message: 'Invalid engineer selected' });
    }

    device.status = 'assigned';
    device.assignedToEngineerId = engineerId;
    device.assignedToPreAssessmentId = preAssessmentId;
    device.assignedAt = new Date();
    device.assignedBy = adminId;
    
    device.deploymentHistory.push({
      preAssessmentId,
      assignedAt: new Date(),
      assignedBy: adminId,
      notes: notes
    });

    await device.save();

    assessment.assignedDeviceId = device._id;
    assessment.assignedDeviceAt = new Date();
    assessment.assessmentStatus = 'device_assigned';
    await assessment.save();

    res.json({
      success: true,
      message: 'Device assigned to engineer successfully',
      device: {
        id: device._id,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        status: device.status,
        assignedToEngineerId: device.assignedToEngineerId,
        assignedToPreAssessmentId: device.assignedToPreAssessmentId
      },
      assessment: {
        id: assessment._id,
        bookingReference: assessment.bookingReference,
        assessmentStatus: assessment.assessmentStatus
      }
    });

  } catch (error) {
    console.error('Assign device error:', error);
    res.status(500).json({ message: 'Failed to assign device', error: error.message });
  }
};

// @desc    Engineer deploys device on site
// @route   POST /api/pre-assessments/:id/deploy-device
// @access  Private (Engineer)
exports.deployDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const engineerId = req.user.id;

    console.log('Engineer deploy device request:', { id, engineerId });

    const assessment = await PreAssessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: 'Pre-assessment not found' });
    }

    if (assessment.assignedEngineerId?.toString() !== engineerId) {
      return res.status(403).json({ message: 'Not authorized for this assessment' });
    }

    if (!assessment.assignedDeviceId) {
      return res.status(400).json({ 
        message: 'No device assigned to this assessment. Please contact admin.' 
      });
    }

    const device = await IoTDevice.findById(assessment.assignedDeviceId);
    if (!device) {
      return res.status(404).json({ message: 'Assigned device not found' });
    }

    if (device.status !== 'assigned') {
      return res.status(400).json({ 
        message: `Device is not ready for deployment. Current status: ${device.status}` 
      });
    }

    device.status = 'deployed';
    device.deployedAt = new Date();
    device.deployedBy = engineerId;
    device.deploymentNotes = notes;
    
    if (device.deploymentHistory.length > 0) {
      const lastDeployment = device.deploymentHistory[device.deploymentHistory.length - 1];
      lastDeployment.deployedAt = new Date();
      lastDeployment.deployedBy = engineerId;
      lastDeployment.notes = notes;
    }
    
    await device.save();

    assessment.iotDeviceId = device._id;
    assessment.deviceDeployedAt = new Date();
    assessment.deviceDeployedBy = engineerId;
    assessment.dataCollectionStart = new Date();
    assessment.assessmentStatus = 'device_deployed';
    await assessment.save();

    res.json({
      success: true,
      message: 'Device deployed successfully on site',
      assessment: {
        id: assessment._id,
        bookingReference: assessment.bookingReference,
        assessmentStatus: assessment.assessmentStatus,
        dataCollectionStart: assessment.dataCollectionStart
      },
      device: {
        id: device._id,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        status: device.status
      }
    });

  } catch (error) {
    console.error('Deploy device error:', error);
    res.status(500).json({ message: 'Failed to deploy device', error: error.message });
  }
};

// @desc    Engineer retrieves device after 7 days
// @route   POST /api/pre-assessments/:id/retrieve-device
// @access  Private (Engineer)
exports.retrieveDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const engineerId = req.user.id;

    console.log('Engineer retrieve device request:', { id, engineerId });

    const assessment = await PreAssessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: 'Pre-assessment not found' });
    }

    if (assessment.assignedEngineerId?.toString() !== engineerId) {
      return res.status(403).json({ message: 'Not authorized for this assessment' });
    }

    if (assessment.assessmentStatus !== 'device_deployed' && assessment.assessmentStatus !== 'data_collecting') {
      return res.status(400).json({ 
        message: `No device deployed to retrieve. Current status: ${assessment.assessmentStatus}` 
      });
    }

    const device = await IoTDevice.findById(assessment.iotDeviceId);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    device.status = 'available';
    device.retrievedAt = new Date();
    device.retrievedBy = engineerId;
    device.retrievalNotes = notes;
    device.assignedToEngineerId = null;
    device.assignedToPreAssessmentId = null;
    
    if (device.deploymentHistory.length > 0) {
      const lastDeployment = device.deploymentHistory[device.deploymentHistory.length - 1];
      lastDeployment.retrievedAt = new Date();
      lastDeployment.retrievedBy = engineerId;
      lastDeployment.notes = notes;
    }
    
    await device.save();

    assessment.deviceRetrievedAt = new Date();
    assessment.deviceRetrievedBy = engineerId;
    assessment.dataCollectionEnd = new Date();
    assessment.assessmentStatus = 'data_analyzing';
    await assessment.save();

    res.json({
      success: true,
      message: 'Device retrieved successfully after data collection',
      assessment: {
        id: assessment._id,
        bookingReference: assessment.bookingReference,
        assessmentStatus: assessment.assessmentStatus,
        totalReadings: assessment.totalReadings || 0,
        dataCollectionDays: Math.ceil((assessment.dataCollectionEnd - assessment.dataCollectionStart) / (1000 * 60 * 60 * 24))
      }
    });

  } catch (error) {
    console.error('Retrieve device error:', error);
    res.status(500).json({ message: 'Failed to retrieve device', error: error.message });
  }
};

// @desc    Update device heartbeat
// @route   POST /api/devices/:deviceId/heartbeat
// @access  Public (Device API)
exports.updateHeartbeat = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { batteryLevel } = req.body;

    const device = await IoTDevice.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    device.lastHeartbeat = new Date();
    if (batteryLevel !== undefined && batteryLevel >= 0 && batteryLevel <= 100) {
      device.batteryLevel = batteryLevel;
    }
    await device.save();

    res.json({
      success: true,
      message: 'Heartbeat updated'
    });

  } catch (error) {
    console.error('Update heartbeat error:', error);
    res.status(500).json({ message: 'Failed to update heartbeat', error: error.message });
  }
};

// @desc    Report device alert
// @route   POST /api/devices/:deviceId/alert
// @access  Public (Device API)
exports.reportAlert = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { type, message } = req.body;

    const device = await IoTDevice.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    device.alerts.push({
      type,
      message,
      createdAt: new Date()
    });

    await device.save();

    res.json({
      success: true,
      message: 'Alert recorded'
    });

  } catch (error) {
    console.error('Report alert error:', error);
    res.status(500).json({ message: 'Failed to report alert', error: error.message });
  }
};