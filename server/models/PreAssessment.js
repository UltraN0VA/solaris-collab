const mongoose = require('mongoose');

const preAssessmentSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  
  // Assessment Details
  propertyType: { type: String, enum: ['residential', 'commercial', 'industrial'], required: true },
  desiredCapacity: { type: String },
  roofType: { type: String, enum: ['concrete', 'metal', 'tile', 'other'] },
  preferredDate: { type: Date, required: true },
  
  // Payment
  assessmentFee: { type: Number, default: 1500 },
  bookingReference: { type: String, unique: true },
  invoiceNumber: { type: String, unique: true },
  paymentMethod: { type: String, enum: ['gcash', 'cash'] },
  paymentProof: { type: String },
  paymentProofFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  paymentReference: { type: String },
  
  // Status
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'for_verification', 'paid', 'failed'],
    default: 'pending'
  },
  assessmentStatus: {
    type: String,
    enum: ['pending_payment', 'scheduled', 'site_visit_ongoing', 'report_draft', 'completed', 'cancelled'],
    default: 'pending_payment'
  },
  
  // IoT Device Integration
  iotDeviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'IoTDevice' },
  deviceDeployedAt: Date,
  deviceDeployedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deviceRetrievedAt: Date,
  deviceRetrievedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dataCollectionStart: Date,
  dataCollectionEnd: Date,
  
  // Data Collection Stats
  totalReadings: { type: Number, default: 0 },
  
  // Site Visit
  assignedEngineerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  siteVisitDate: Date,
  siteVisitNotes: String,
  sitePhotos: [String],
  
  // Engineer Assessment Fields
  engineerAssessment: {
    siteInspectionDate: Date,
    inspectionNotes: String,
    roofCondition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    structuralIntegrity: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    shadingAnalysis: String,
    recommendedPanelPlacement: String,
    estimatedInstallationTime: Number, // in days
    additionalMaterials: [{
      name: String,
      quantity: Number,
      estimatedCost: Number
    }],
    safetyConsiderations: [String],
    recommendations: String
  },
  
  // Assessment Documents (Quotation PDF, etc.)
  assessmentDocuments: [{
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    documentType: {
      type: String,
      enum: ['quotation_pdf', 'technical_report', 'site_sketch', 'structural_analysis', 'electrical_diagram', 'safety_report', 'other']
    },
    description: String,
    uploadedAt: Date
  }],
  
  // Quotation Details
  quotation: {
    quotationFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    quotationUrl: String,
    quotationNumber: String,
    quotationDate: Date,
    quotationExpiryDate: Date,
    systemDetails: {
      systemSize: Number,
      systemType: String,
      panelsNeeded: Number,
      inverterType: String,
      batteryType: String,
      installationCost: Number,
      equipmentCost: Number,
      totalCost: Number,
      paymentTerms: String,
      warrantyYears: Number
    },
    generatedAt: Date,
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  
  // Results
  detailedReport: { type: String },
  finalQuotation: { type: String },
  finalSystemSize: Number,
  finalSystemCost: Number,
  recommendedSystemType: { type: String, enum: ['grid-tie', 'hybrid', 'off-grid'] },
  panelsNeeded: Number,
  estimatedAnnualProduction: Number,
  estimatedAnnualSavings: Number,
  paybackPeriod: Number,
  co2Offset: Number,
  
  // Engineer Recommendations
  engineerRecommendations: String,
  technicalFindings: String,
  
  // Engineer Comments
  engineerComments: [{
    comment: String,
    commentedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    commentedAt: Date,
    isPublic: { type: Boolean, default: true }
  }],
  
  // Admin Remarks
  adminRemarks: String,
  
  // Timestamps
  bookedAt: { type: Date, default: Date.now },
  confirmedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

// Indexes for faster queries
preAssessmentSchema.index({ assignedEngineerId: 1, assessmentStatus: 1 });

preAssessmentSchema.index({ clientId: 1, assessmentStatus: 1 });

module.exports = mongoose.model('PreAssessment', preAssessmentSchema);