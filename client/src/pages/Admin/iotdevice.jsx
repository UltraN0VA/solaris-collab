// pages/Admin/IoTDevice.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import {
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaWifi,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUpload,
  FaDownload,
  FaTools,
  FaTimes,
  FaSave,
  FaUserCheck,
  FaInfoCircle,
  FaUserCog
} from 'react-icons/fa';
import '../../styles/Admin/iotDevice.css';

const IoTDevice = () => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false); // Changed from Deploy to Assign
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [preAssessments, setPreAssessments] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    deviceName: '',
    model: '',
    manufacturer: 'Salfer Engineering',
    serialNumber: '',
    firmwareVersion: '1.0.0',
    engineerId: '',
    preAssessmentId: '',
    assignmentNotes: '',
    maintenanceType: 'calibration',
    maintenanceNotes: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    assigned: 0,
    deployed: 0,
    data_collecting: 0,
    maintenance: 0,
    retired: 0
  });

  useEffect(() => {
    fetchDevices();
    fetchStats();
    fetchAvailablePreAssessments();
    fetchEngineers();
  }, [filter, currentPage]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/devices`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: filter === 'all' ? undefined : filter, page: currentPage, limit: 10 }
      });
      setDevices(response.data.devices || []);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/devices/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAvailablePreAssessments = async () => {
    try {
      const token = sessionStorage.getItem('token');
      // Fetch pre-assessments that are ready for device assignment (payment verified)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pre-assessments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { assessmentStatus: 'payment_verified' }
      });
      setPreAssessments(response.data.assessments || []);
    } catch (error) {
      console.error('Error fetching pre-assessments:', error);
    }
  };

  const fetchEngineers = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users?role=engineer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEngineers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching engineers:', error);
    }
  };

  const handleCreateDevice = async () => {
    if (!formData.deviceName || !formData.model) {
      alert('Please fill in device name and model');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/devices`,
        {
          deviceName: formData.deviceName,
          model: formData.model,
          manufacturer: formData.manufacturer,
          serialNumber: formData.serialNumber,
          firmwareVersion: formData.firmwareVersion
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Device created successfully!');
      setShowDeviceModal(false);
      resetForm();
      fetchDevices();
      fetchStats();
    } catch (error) {
      console.error('Error creating device:', error);
      alert(error.response?.data?.message || 'Failed to create device');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDevice = async () => {
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/devices/${selectedDevice._id}`,
        {
          deviceName: formData.deviceName,
          model: formData.model,
          manufacturer: formData.manufacturer,
          serialNumber: formData.serialNumber,
          firmwareVersion: formData.firmwareVersion
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Device updated successfully!');
      setShowDeviceModal(false);
      setSelectedDevice(null);
      fetchDevices();
    } catch (error) {
      console.error('Error updating device:', error);
      alert(error.response?.data?.message || 'Failed to update device');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDevice = async () => {
    if (!window.confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/devices/${selectedDevice._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Device deleted successfully!');
      setShowDeviceModal(false);
      setSelectedDevice(null);
      fetchDevices();
      fetchStats();
    } catch (error) {
      console.error('Error deleting device:', error);
      alert(error.response?.data?.message || 'Failed to delete device');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignDevice = async () => {
  // Validation
  if (!formData.engineerId) {
    alert('Please select an engineer');
    return;
  }
  if (!formData.preAssessmentId) {
    alert('Please select a pre-assessment');
    return;
  }
  
  // Check if engineers are loaded
  if (engineers.length === 0) {
    alert('Loading engineer list... Please wait a moment and try again.');
    await fetchEngineers(); // Wait for engineers to load
    return;
  }

  // Find the selected engineer
  const selectedEngineer = engineers.find(e => e._id === formData.engineerId);
  if (!selectedEngineer) {
    console.error('Engineer not found. Engineer ID:', formData.engineerId);
    console.log('Available engineers:', engineers.map(e => ({ id: e._id, name: e.name })));
    alert('Selected engineer not found. Please refresh the page and try again.');
    fetchEngineers(); // Refresh the list
    return;
  }

  setIsSubmitting(true);
  
  try {
    const token = sessionStorage.getItem('token');
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/admin/devices/${selectedDevice._id}/assign`,
      {
        engineerId: formData.engineerId,
        preAssessmentId: formData.preAssessmentId,
        notes: formData.assignmentNotes
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      // Success message with engineer name
      alert(`Device assigned successfully to ${selectedEngineer.name}`);
      
      // Reset form and close modal
      setShowAssignModal(false);
      setSelectedDevice(null);
      setFormData({ 
        ...formData, 
        engineerId: '', 
        preAssessmentId: '', 
        assignmentNotes: '' 
      });
      
      // Refresh data
      fetchDevices();
      fetchStats();
      fetchAvailablePreAssessments();
    } else {
      alert(response.data.message || 'Failed to assign device');
    }
  } catch (error) {
    console.error('Error assigning device:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to assign device';
    alert(`${errorMessage}`);
  } finally {
    setIsSubmitting(false);
  }
};
  const handleMaintenance = async () => {
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/devices/${selectedDevice._id}`,
        {
          status: 'maintenance',
          maintenanceHistory: [
            ...(selectedDevice.maintenanceHistory || []),
            {
              type: formData.maintenanceType,
              notes: formData.maintenanceNotes,
              date: new Date()
            }
          ]
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Device marked for maintenance');
      setShowMaintenanceModal(false);
      setSelectedDevice(null);
      fetchDevices();
      fetchStats();
    } catch (error) {
      console.error('Error updating maintenance:', error);
      alert('Failed to update device status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deviceName: '',
      model: '',
      manufacturer: 'Salfer Engineering',
      serialNumber: '',
      firmwareVersion: '1.0.0',
      engineerId: '',
      preAssessmentId: '',
      assignmentNotes: '',
      maintenanceType: 'calibration',
      maintenanceNotes: ''
    });
  };

  const openEditModal = (device) => {
    setSelectedDevice(device);
    setFormData({
      ...formData,
      deviceName: device.deviceName,
      model: device.model,
      manufacturer: device.manufacturer,
      serialNumber: device.serialNumber || '',
      firmwareVersion: device.firmwareVersion
    });
    setModalMode('edit');
    setShowDeviceModal(true);
  };

  const openViewModal = (device) => {
    setSelectedDevice(device);
    setModalMode('view');
    setShowDeviceModal(true);
  };

  const openAssignModal = (device) => {
    if (device.status !== 'available') {
      alert(`Device is ${device.status}. Only available devices can be assigned.`);
      return;
    }
    setSelectedDevice(device);
    setShowAssignModal(true);
  };

  const openMaintenanceModal = (device) => {
    setSelectedDevice(device);
    setShowMaintenanceModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'available': <span className="status-badge-iotdevicead available-iotdevicead">Available</span>,
      'assigned': <span className="status-badge-iotdevicead assigned-iotdevicead">Assigned</span>,
      'deployed': <span className="status-badge-iotdevicead deployed-iotdevicead">Deployed</span>,
      'data_collecting': <span className="status-badge-iotdevicead data-collecting-iotdevicead">Data Collecting</span>,
      'maintenance': <span className="status-badge-iotdevicead maintenance-iotdevicead">Maintenance</span>,
      'retired': <span className="status-badge-iotdevicead retired-iotdevicead">Retired</span>
    };
    return badges[status] || <span className="status-badge-iotdevicead">{status}</span>;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDevices = devices.filter(device => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return device.deviceId?.toLowerCase().includes(searchLower) ||
      device.deviceName?.toLowerCase().includes(searchLower) ||
      device.model?.toLowerCase().includes(searchLower) ||
      device.serialNumber?.toLowerCase().includes(searchLower);
  });

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="iot-device-management-iotdevicead">
      <div className="iot-header-iotdevicead">
        <div className="skeleton-line-iotdevicead large-iotdevicead"></div>
        <div className="skeleton-button-iotdevicead"></div>
      </div>
      <div className="iot-stats-iotdevicead">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="stat-card-iotdevicead skeleton-card-iotdevicead">
            <div className="skeleton-line-iotdevicead small-iotdevicead"></div>
            <div className="skeleton-line-iotdevicead large-iotdevicead"></div>
          </div>
        ))}
      </div>
      <div className="iot-filters-iotdevicead">
        <div className="skeleton-select-iotdevicead"></div>
        <div className="skeleton-search-iotdevicead"></div>
      </div>
      <div className="iot-table-container-iotdevicead">
        <div className="skeleton-table-iotdevicead">
          <div className="skeleton-table-header-iotdevicead"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-table-row-iotdevicead"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && devices.length === 0) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <Helmet>
        <title>IoT Device Management | Admin | Salfer Engineering</title>
      </Helmet>

      <div className="iot-device-management-iotdevicead">
        <div className="iot-header-iotdevicead">
          <div>
            <h1>IoT Device Management</h1>
            <p>Manage IoT devices, assign to engineers for deployment, and monitor device health</p>
          </div>
          <button className="create-device-btn-iotdevicead" onClick={() => { setModalMode('create'); resetForm(); setShowDeviceModal(true); }}>
            <FaPlus /> Add New Device
          </button>
        </div>

        <div className="iot-stats-iotdevicead">
          <div className="stat-card-iotdevicead total-iotdevicead">
            <div className="stat-info-iotdevicead">
              <span className="stat-value-iotdevicead">{stats.total || 0}</span>
              <span className="stat-label-iotdevicead">Total Devices</span>
            </div>
          </div>
          <div className="stat-card-iotdevicead available-iotdevicead">
            <div className="stat-info-iotdevicead">
              <span className="stat-value-iotdevicead">{stats.available || 0}</span>
              <span className="stat-label-iotdevicead">Available</span>
            </div>
          </div>
          <div className="stat-card-iotdevicead assigned-iotdevicead">
            <div className="stat-info-iotdevicead">
              <span className="stat-value-iotdevicead">{stats.assigned || 0}</span>
              <span className="stat-label-iotdevicead">Assigned</span>
            </div>
          </div>
          <div className="stat-card-iotdevicead deployed-iotdevicead">
            <div className="stat-info-iotdevicead">
              <span className="stat-value-iotdevicead">{(stats.deployed || 0) + (stats.data_collecting || 0)}</span>
              <span className="stat-label-iotdevicead">Deployed/Active</span>
            </div>
          </div>
          <div className="stat-card-iotdevicead maintenance-iotdevicead">
            <div className="stat-info-iotdevicead">
              <span className="stat-value-iotdevicead">{stats.maintenance || 0}</span>
              <span className="stat-label-iotdevicead">Maintenance</span>
            </div>
          </div>
          <div className="stat-card-iotdevicead retired-iotdevicead">
            <div className="stat-info-iotdevicead">
              <span className="stat-value-iotdevicead">{stats.retired || 0}</span>
              <span className="stat-label-iotdevicead">Retired</span>
            </div>
          </div>
        </div>

        <div className="iot-filters-iotdevicead">
          <div className="filter-group-iotdevicead">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Devices</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="deployed">Deployed</option>
              <option value="data_collecting">Data Collecting</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div className="search-group-iotdevicead">
            <FaSearch className="search-icon-iotdevicead" />
            <input 
              type="text" 
              placeholder="Search by ID, name, model, or serial..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        <div className="iot-table-container-iotdevicead">
          <table className="iot-table-iotdevicead">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Name</th>
                <th>Model</th>
                <th>Firmware</th>
                <th>Status</th>
                <th>Battery</th>
                <th>Assigned To</th>
                <th>Last Heartbeat</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-state-iotdevicead">
                    <p>No devices found</p>
                  </td>
                </tr>
              ) : (
                filteredDevices.map(device => (
                  <tr key={device._id}>
                    <td className="device-id-iotdevicead">{device.deviceId}</td>
                    <td><strong>{device.deviceName}</strong></td>
                    <td>{device.model}</td>
                    <td>v{device.firmwareVersion}</td>
                    <td>{getStatusBadge(device.status)}</td>
                    <td className="battery-cell-iotdevicead">
                      <span className={`battery-level-${device.batteryLevel < 20 ? 'low' : device.batteryLevel < 50 ? 'medium' : 'high'}`}>
                        {device.batteryLevel || '—'}%
                      </span>
                    </td>
                    <td>
                      {device.assignedToEngineerId ? (
                        <span className="assigned-engineer">
                          <FaUserCog /> {device.assignedToEngineerId.name}
                        </span>
                      ) : (
                        <span className="not-assigned">—</span>
                      )}
                    </td>
                    <td>{formatDate(device.lastHeartbeat)}</td>
                    <td className="actions-cell-iotdevicead">
                      <button className="action-btn-iotdevicead view-iotdevicead" onClick={() => openViewModal(device)} title="View Details">
                        <FaEye />
                      </button>
                      {device.status === 'available' && (
                        <>
                          <button className="action-btn-iotdevicead edit-iotdevicead" onClick={() => openEditModal(device)} title="Edit">
                            <FaEdit />
                          </button>
                          <button className="action-btn-iotdevicead assign-iotdevicead" onClick={() => openAssignModal(device)} title="Assign to Engineer">
                            <FaUserCheck />
                          </button>
                        </>
                      )}
                      {device.status === 'assigned' && (
                        <span className="action-note">Waiting for engineer deployment</span>
                      )}
                      {(device.status === 'deployed' || device.status === 'data_collecting') && (
                        <span className="action-note active">Device Active</span>
                      )}
                      {device.status !== 'retired' && device.status !== 'assigned' && device.status !== 'deployed' && device.status !== 'data_collecting' && (
                        <button className="action-btn-iotdevicead maintenance-iotdevicead" onClick={() => openMaintenanceModal(device)} title="Maintenance">
                          <FaTools />
                        </button>
                      )}
                      {device.status === 'available' && (
                        <button className="action-btn-iotdevicead delete-iotdevicead" onClick={() => { setSelectedDevice(device); if (window.confirm('Delete this device?')) handleDeleteDevice(); }} title="Delete">
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-iotdevicead">
            <button className="page-btn-iotdevicead" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <FaChevronLeft /> Previous
            </button>
            <span className="page-info-iotdevicead">Page {currentPage} of {totalPages}</span>
            <button className="page-btn-iotdevicead" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Next <FaChevronRight />
            </button>
          </div>
        )}

        {/* Device Modal (Create/Edit/View) */}
        {showDeviceModal && (
          <div className="modal-overlay-iotdevicead" onClick={() => setShowDeviceModal(false)}>
            <div className="modal-content-iotdevicead device-modal-iotdevicead" onClick={e => e.stopPropagation()}>
              <h3>{modalMode === 'create' ? 'Add New Device' : modalMode === 'edit' ? 'Edit Device' : 'Device Details'}</h3>
              {modalMode === 'view' && selectedDevice ? (
                <div className="device-details-view-iotdevicead">
                  <div className="detail-section-iotdevicead">
                    <h4>Device Information</h4>
                    <p><strong>Device ID:</strong> {selectedDevice.deviceId}</p>
                    <p><strong>Name:</strong> {selectedDevice.deviceName}</p>
                    <p><strong>Model:</strong> {selectedDevice.model}</p>
                    <p><strong>Manufacturer:</strong> {selectedDevice.manufacturer}</p>
                    <p><strong>Serial Number:</strong> {selectedDevice.serialNumber || '—'}</p>
                    <p><strong>Firmware:</strong> v{selectedDevice.firmwareVersion}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedDevice.status)}</p>
                    <p><strong>Battery:</strong> {selectedDevice.batteryLevel || '—'}%</p>
                    <p><strong>Last Heartbeat:</strong> {formatDate(selectedDevice.lastHeartbeat)}</p>
                    {selectedDevice.assignedToEngineerId && (
                      <p><strong>Assigned Engineer:</strong> {selectedDevice.assignedToEngineerId.name} ({selectedDevice.assignedToEngineerId.email})</p>
                    )}
                  </div>
                  <div className="detail-section-iotdevicead">
                    <h4>Deployment History</h4>
                    {selectedDevice.deploymentHistory?.length > 0 ? selectedDevice.deploymentHistory.map((h, i) => (
                      <div key={i} className="history-item-iotdevicead">
                        <p><strong>Assigned:</strong> {formatDate(h.assignedAt)}</p>
                        <p><strong>Deployed:</strong> {formatDate(h.deployedAt) || 'Not yet deployed'}</p>
                        <p><strong>Retrieved:</strong> {formatDate(h.retrievedAt) || 'Still active'}</p>
                        <p><strong>Notes:</strong> {h.notes || '—'}</p>
                      </div>
                    )) : <p>No deployment history</p>}
                  </div>
                  <div className="detail-section-iotdevicead">
                    <h4>Maintenance History</h4>
                    {selectedDevice.maintenanceHistory?.length > 0 ? selectedDevice.maintenanceHistory.map((m, i) => (
                      <div key={i} className="history-item-iotdevicead">
                        <p><strong>Type:</strong> {m.type}</p>
                        <p><strong>Date:</strong> {formatDate(m.date)}</p>
                        <p><strong>Notes:</strong> {m.notes}</p>
                      </div>
                    )) : <p>No maintenance history</p>}
                  </div>
                </div>
              ) : (
                <div className="device-form-iotdevicead">
                  <div className="form-group-iotdevicead">
                    <label>Device Name *</label>
                    <input 
                      type="text" 
                      value={formData.deviceName} 
                      onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })} 
                      placeholder="e.g., IoT Sensor 01" 
                    />
                  </div>
                  <div className="form-row-iotdevicead">
                    <div className="form-group-iotdevicead">
                      <label>Model *</label>
                      <input 
                        type="text" 
                        value={formData.model} 
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })} 
                        placeholder="e.g., ESP32-S3" 
                      />
                    </div>
                    <div className="form-group-iotdevicead">
                      <label>Manufacturer</label>
                      <input 
                        type="text" 
                        value={formData.manufacturer} 
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} 
                        placeholder="Salfer Engineering" 
                      />
                    </div>
                  </div>
                  <div className="form-row-iotdevicead">
                    <div className="form-group-iotdevicead">
                      <label>Serial Number</label>
                      <input 
                        type="text" 
                        value={formData.serialNumber} 
                        onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} 
                        placeholder="Enter serial number" 
                      />
                    </div>
                    <div className="form-group-iotdevicead">
                      <label>Firmware Version</label>
                      <input 
                        type="text" 
                        value={formData.firmwareVersion} 
                        onChange={(e) => setFormData({ ...formData, firmwareVersion: e.target.value })} 
                        placeholder="1.0.0" 
                      />
                    </div>
                  </div>
                  <div className="modal-actions-iotdevicead">
                    <button className="cancel-btn-iotdevicead" onClick={() => setShowDeviceModal(false)}>Cancel</button>
                    {(modalMode === 'create' || modalMode === 'edit') && (
                      <button className="save-btn-iotdevicead" onClick={modalMode === 'create' ? handleCreateDevice : handleUpdateDevice} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Device'}
                      </button>
                    )}
                  </div>
                </div>
              )}
              {modalMode === 'view' && (
                <div className="modal-actions-iotdevicead">
                  <button className="cancel-btn-iotdevicead" onClick={() => setShowDeviceModal(false)}>Close</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ASSIGN MODAL - Admin assigns device to engineer */}
        {showAssignModal && selectedDevice && (
          <div className="modal-overlay-iotdevicead" onClick={() => setShowAssignModal(false)}>
            <div className="modal-content-iotdevicead" onClick={e => e.stopPropagation()}>
              <h3>Assign Device to Engineer</h3>
              <p><strong>Device:</strong> {selectedDevice.deviceId} - {selectedDevice.deviceName}</p>
              <p><strong>Status:</strong> {getStatusBadge(selectedDevice.status)}</p>
              
              <div className="form-group-iotdevicead">
                <label>Select Engineer *</label>
                <select 
                  value={formData.engineerId} 
                  onChange={(e) => setFormData({ ...formData, engineerId: e.target.value })}
                >
                  <option value="">Select an engineer...</option>
                  {engineers.map(eng => (
                    <option key={eng._id} value={eng._id}>
                      {eng.name} ({eng.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group-iotdevicead">
                <label>Select Pre-Assessment *</label>
                <select 
                  value={formData.preAssessmentId} 
                  onChange={(e) => setFormData({ ...formData, preAssessmentId: e.target.value })}
                >
                  <option value="">Select a pre-assessment with verified payment...</option>
                  {preAssessments.map(pa => (
                    <option key={pa._id} value={pa._id}>
                      {pa.bookingReference} - {pa.clientId?.contactFirstName} {pa.clientId?.contactLastName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group-iotdevicead">
                <label>Assignment Notes (Optional)</label>
                <textarea 
                  rows="3" 
                  value={formData.assignmentNotes} 
                  onChange={(e) => setFormData({ ...formData, assignmentNotes: e.target.value })}
                  placeholder="Add notes about this assignment..."
                />
              </div>
              
              <div className="info-box-iotdevicead">
                <FaInfoCircle />
                <small>After assignment, the engineer will deploy the device on site. You can track deployment status in the device list.</small>
              </div>
              
              <div className="modal-actions-iotdevicead">
                <button className="cancel-btn-iotdevicead" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button 
                  className="assign-btn-iotdevicead" 
                  onClick={handleAssignDevice} 
                  disabled={!formData.engineerId || !formData.preAssessmentId || isSubmitting}
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Device'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Modal */}
        {showMaintenanceModal && selectedDevice && (
          <div className="modal-overlay-iotdevicead" onClick={() => setShowMaintenanceModal(false)}>
            <div className="modal-content-iotdevicead" onClick={e => e.stopPropagation()}>
              <h3>Device Maintenance</h3>
              <p><strong>Device:</strong> {selectedDevice.deviceId} - {selectedDevice.deviceName}</p>
              <div className="form-group-iotdevicead">
                <label>Maintenance Type</label>
                <select value={formData.maintenanceType} onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}>
                  <option value="calibration">Calibration</option>
                  <option value="repair">Repair</option>
                  <option value="battery_replacement">Battery Replacement</option>
                </select>
              </div>
              <div className="form-group-iotdevicead">
                <label>Notes</label>
                <textarea 
                  rows="3" 
                  value={formData.maintenanceNotes} 
                  onChange={(e) => setFormData({ ...formData, maintenanceNotes: e.target.value })} 
                  placeholder="Describe maintenance performed..." 
                />
              </div>
              <div className="modal-actions-iotdevicead">
                <button className="cancel-btn-iotdevicead" onClick={() => setShowMaintenanceModal(false)}>Cancel</button>
                <button className="maintenance-btn-iotdevicead" onClick={handleMaintenance} disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Mark for Maintenance'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default IoTDevice;