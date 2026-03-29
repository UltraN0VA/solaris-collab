// pages/Engineer/IoTDevice.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import {
  FaSearch,
  FaEye,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaChartLine,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMicrochip,
  FaBatteryFull,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBatteryEmpty,
  FaWifi,
  FaDownload,
  FaThermometerHalf,
  FaTachometerAlt,
  FaClock
} from 'react-icons/fa';
import { useToast, ToastNotification } from '../../assets/toastnotification';
import '../../styles/Engineer/iotDevice.css';

const IoTDevice = () => {
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [deviceData, setDeviceData] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    collecting: 0,
    completed: 0
  });

  useEffect(() => {
    fetchDevices();
    fetchStats();
  }, [filter, currentPage]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/engineer/devices`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: filter === 'all' ? undefined : filter,
          page: currentPage,
          limit: 12
        }
      });

      setDevices(response.data.devices || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching devices:', error);
      showToast('Failed to fetch devices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/engineer/devices/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDeviceData = async (device) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/engineer/devices/${device._id}/data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeviceData(response.data.readings || []);
    } catch (error) {
      console.error('Error fetching device data:', error);
      showToast('Failed to fetch device data', 'error');
    }
  };

  const handleViewDevice = (device) => {
    setSelectedDevice(device);
    fetchDeviceData(device);
    setShowDeviceModal(true);
  };

  const handleViewData = (device) => {
    setSelectedDevice(device);
    fetchDeviceData(device);
    setShowDataModal(true);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBatteryIcon = (level) => {
    if (level >= 75) return <FaBatteryFull className="battery-high" />;
    if (level >= 50) return <FaBatteryHalf className="battery-medium" />;
    if (level >= 25) return <FaBatteryQuarter className="battery-low" />;
    return <FaBatteryEmpty className="battery-critical" />;
  };

  const getBatteryClass = (level) => {
    if (level >= 75) return 'high';
    if (level >= 50) return 'medium';
    if (level >= 25) return 'low';
    return 'critical';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': <span className="status-badge active">Active</span>,
      'deployed': <span className="status-badge deployed">Deployed</span>,
      'collecting': <span className="status-badge collecting">Data Collecting</span>,
      'completed': <span className="status-badge completed">Completed</span>,
      'maintenance': <span className="status-badge maintenance">Maintenance</span>
    };
    return badges[status] || <span className="status-badge">{status}</span>;
  };

  const getDataSummary = (data) => {
    if (!data.length) return null;

    const avgPower = data.reduce((sum, r) => sum + (r.power || 0), 0) / data.length;
    const maxPower = Math.max(...data.map(r => r.power || 0));
    const avgTemp = data.reduce((sum, r) => sum + (r.temperature || 0), 0) / data.length;

    return { avgPower: avgPower.toFixed(1), maxPower: maxPower.toFixed(1), avgTemp: avgTemp.toFixed(1) };
  };

  const handleExportData = async (device) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/engineer/devices/${device._id}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `device_data_${device.deviceId}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Data exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Failed to export data', 'error');
    }
  };

  const filteredDevices = devices.filter(device => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return device.deviceId?.toLowerCase().includes(searchLower) ||
      device.deviceName?.toLowerCase().includes(searchLower) ||
      device.assessmentReference?.toLowerCase().includes(searchLower) ||
      device.clientName?.toLowerCase().includes(searchLower);
  });

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="iot-device-container">
      <div className="device-header">
        <div className="skeleton-line large"></div>
        <div className="skeleton-line medium"></div>
      </div>
      <div className="stats-cards">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="stat-card skeleton-card">
            <div className="skeleton-line small"></div>
            <div className="skeleton-line large"></div>
          </div>
        ))}
      </div>
      <div className="device-filters">
        <div className="skeleton-select"></div>
        <div className="skeleton-search"></div>
      </div>
      <div className="devices-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="device-card skeleton-card">
            <div className="skeleton-line medium"></div>
            <div className="skeleton-line small"></div>
            <div className="skeleton-line tiny"></div>
            <div className="skeleton-badge"></div>
            <div className="skeleton-button-group">
              <div className="skeleton-button small"></div>
              <div className="skeleton-button small"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading && devices.length === 0) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <Helmet>
        <title>IoT Device Data | Engineer Dashboard</title>
      </Helmet>

      <div className="iot-device-container">
        <div className="device-header">
          <h1>IoT Device Data</h1>
          <p>Monitor IoT device data from your assigned sites</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card total">
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Devices</span>
            </div>
          </div>
          <div className="stat-card active">
            <div className="stat-info">
              <span className="stat-value">{stats.active}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>
          <div className="stat-card collecting">
            <div className="stat-info">
              <span className="stat-value">{stats.collecting}</span>
              <span className="stat-label">Collecting Data</span>
            </div>
          </div>
          <div className="stat-card completed">
            <div className="stat-info">
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="device-filters">
          <div className="filter-group">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Devices</option>
              <option value="active">Active</option>
              <option value="collecting">Collecting Data</option>
              <option value="completed">Completed</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="search-group">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by device ID, name, or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Devices Grid - Cards Layout */}
        <div className="devices-grid">
          {filteredDevices.length === 0 ? (
            <div className="empty-state">
              <FaMicrochip className="empty-icon" />
              <p>No devices found</p>
            </div>
          ) : (
            filteredDevices.map(device => {
              const dataSummary = device.recentData ? getDataSummary(device.recentData) : null;
              return (
                <div key={device._id} className="device-card">
                  <div className="device-header-card">
                    <div className="device-icon">
                      <FaMicrochip />
                    </div>
                    <div className="device-info">
                      <h3>{device.deviceName}</h3>
                      <span className="device-id">{device.deviceId}</span>
                    </div>
                    {getStatusBadge(device.status)}
                  </div>

                  <div className="device-specs">
                    <div className="spec-item">
                      <span className="spec-label">Client</span>
                      <span className="spec-value">{device.clientName || '—'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Assessment</span>
                      <span className="spec-value">{device.assessmentReference || '—'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Location</span>
                      <span className="spec-value location-value">{device.location || '—'}</span>
                    </div>
                  </div>

                  {/* Data Summary Section */}
                  {dataSummary && (
                    <div className="data-summary">
                      <div className="summary-row">
                        <div className="summary-item">
                          <FaTachometerAlt />
                          <div>
                            <span>Avg Power</span>
                            <strong>{dataSummary.avgPower} W</strong>
                          </div>
                        </div>
                        <div className="summary-item">
                          <FaThermometerHalf />
                          <div>
                            <span>Avg Temp</span>
                            <strong>{dataSummary.avgTemp} °C</strong>
                          </div>
                        </div>
                      </div>
                      <div className="summary-row">
                        <div className="summary-item">
                          <FaChartLine />
                          <div>
                            <span>Peak Power</span>
                            <strong>{dataSummary.maxPower} W</strong>
                          </div>
                        </div>
                        <div className="summary-item">
                          <FaClock />
                          <div>
                            <span>Last Reading</span>
                            <strong>{formatDateOnly(device.lastReading)}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="device-footer">
                    <div className="battery-status">
                      {getBatteryIcon(device.batteryLevel)}
                      <span className={`battery-level ${getBatteryClass(device.batteryLevel)}`}>
                        {device.batteryLevel || '—'}%
                      </span>
                    </div>
                    <div className="last-heartbeat">
                      <FaClock />
                      <span>{formatDate(device.lastHeartbeat)}</span>
                    </div>
                  </div>

                  <div className="device-actions">
                    <button className="action-btn view" onClick={() => handleViewDevice(device)} title="View Details">
                      <FaEye />
                    </button>
                    {(device.status === 'collecting' || device.status === 'active') && (
                      <button className="action-btn data" onClick={() => handleViewData(device)} title="View Data">
                        <FaChartLine />
                      </button>
                    )}
                    {device.recentData?.length > 0 && (
                      <button className="action-btn export" onClick={() => handleExportData(device)} title="Export Data">
                        <FaDownload />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft /> Previous
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button
              className="page-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}

        {/* Device Details Modal */}
        {showDeviceModal && selectedDevice && (
          <div className="modal-overlay" onClick={() => setShowDeviceModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowDeviceModal(false)}>×</button>
              <h2>Device Details</h2>

              <div className="device-details">
                <div className="detail-section">
                  <h3>Device Information</h3>
                  <p><strong>Device ID:</strong> {selectedDevice.deviceId}</p>
                  <p><strong>Name:</strong> {selectedDevice.deviceName}</p>
                  <p><strong>Model:</strong> {selectedDevice.model || 'N/A'}</p>
                  <p><strong>Firmware:</strong> v{selectedDevice.firmwareVersion || '1.0.0'}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedDevice.status)}</p>
                </div>

                <div className="detail-section">
                  <h3>Assessment Information</h3>
                  <p><strong>Reference:</strong> {selectedDevice.assessmentReference || '—'}</p>
                  <p><strong>Client:</strong> {selectedDevice.clientName || '—'}</p>
                  <p><strong>Location:</strong> {selectedDevice.location || '—'}</p>
                  <p><strong>Deployed:</strong> {formatDate(selectedDevice.deployedAt)}</p>
                  {selectedDevice.expectedReturn && (
                    <p><strong>Expected Return:</strong> {formatDateOnly(selectedDevice.expectedReturn)}</p>
                  )}
                </div>

                <div className="detail-section">
                  <h3>Device Health</h3>
                  <p><strong>Battery Level:</strong> {selectedDevice.batteryLevel || '—'}%</p>
                  <p><strong>Last Heartbeat:</strong> {formatDate(selectedDevice.lastHeartbeat)}</p>
                  <p><strong>Last Reading:</strong> {formatDate(selectedDevice.lastReading)}</p>
                  <p><strong>Total Readings:</strong> {selectedDevice.totalReadings || 0}</p>
                </div>

                {deviceData.length > 0 && (
                  <div className="detail-section">
                    <h3>Data Summary (Last 24h)</h3>
                    {(() => {
                      const summary = getDataSummary(deviceData);
                      return (
                        <>
                          <p><strong>Avg Power:</strong> {summary.avgPower} W</p>
                          <p><strong>Peak Power:</strong> {summary.maxPower} W</p>
                          <p><strong>Avg Temperature:</strong> {summary.avgTemp} °C</p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                {(selectedDevice.status === 'collecting' || selectedDevice.status === 'active') && (
                  <button className="btn-primary" onClick={() => {
                    setShowDeviceModal(false);
                    handleViewData(selectedDevice);
                  }}>
                    View Full Data
                  </button>
                )}
                <button className="btn-secondary" onClick={() => setShowDeviceModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Device Data Modal */}
        {showDataModal && selectedDevice && (
          <div className="modal-overlay" onClick={() => setShowDataModal(false)}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowDataModal(false)}>×</button>
              <h2>Device Data - {selectedDevice.deviceName}</h2>
              <p className="modal-subtitle">
                {selectedDevice.assessmentReference} | {selectedDevice.clientName}
              </p>

              <div className="data-summary-cards">
                {(() => {
                  const summary = getDataSummary(deviceData);
                  return (
                    <div className="summary-cards">
                      <div className="summary-card">
                        <span>Avg Power</span>
                        <strong>{summary.avgPower} W</strong>
                      </div>
                      <div className="summary-card">
                        <span>Peak Power</span>
                        <strong>{summary.maxPower} W</strong>
                      </div>
                      <div className="summary-card">
                        <span>Avg Temp</span>
                        <strong>{summary.avgTemp} °C</strong>
                      </div>
                      <div className="summary-card">
                        <span>Readings</span>
                        <strong>{deviceData.length}</strong>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>Voltage (V)</th>
                      <th>Current (A)</th>
                      <th>Power (W)</th>
                      <th>Temperature (°C)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deviceData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-state">No data available</td>
                      </tr>
                    ) : (
                      deviceData.map((reading, index) => (
                        <tr key={index}>
                          <td>{formatDate(reading.timestamp)}</td>
                          <td>{reading.voltage?.toFixed(2) || 'N/A'}</td>
                          <td>{reading.current?.toFixed(2) || 'N/A'}</td>
                          <td>{reading.power?.toFixed(2) || 'N/A'}</td>
                          <td>{reading.temperature?.toFixed(1) || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowDataModal(false)}>
                  Close
                </button>
                {deviceData.length > 0 && (
                  <button className="btn-primary" onClick={() => handleExportData(selectedDevice)}>
                    <FaDownload /> Export CSV
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        <ToastNotification
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          position="bottom-right"
        />
      </div>
    </>
  );
};

export default IoTDevice;