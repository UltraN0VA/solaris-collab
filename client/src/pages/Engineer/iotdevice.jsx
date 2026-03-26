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
  FaDownload
} from 'react-icons/fa';
import '../../styles/Engineer/iotDevice.css';

const IoTDevice = () => {
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
          limit: 10
        }
      });

      setDevices(response.data.devices || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching devices:', error);
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
    if (level >= 75) return <FaBatteryFull className="battery-high-engdevice" />;
    if (level >= 50) return <FaBatteryHalf className="battery-medium-engdevice" />;
    if (level >= 25) return <FaBatteryQuarter className="battery-low-engdevice" />;
    return <FaBatteryEmpty className="battery-critical-engdevice" />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': <span className="status-badge-engdevice active-engdevice">Active</span>,
      'deployed': <span className="status-badge-engdevice deployed-engdevice">Deployed - Collecting Data</span>,
      'collecting': <span className="status-badge-engdevice collecting-engdevice">Collecting Data</span>,
      'completed': <span className="status-badge-engdevice completed-engdevice">Completed</span>,
      'maintenance': <span className="status-badge-engdevice maintenance-engdevice">Maintenance</span>
    };
    return badges[status] || <span className="status-badge-engdevice">{status}</span>;
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
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
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
    <div className="iot-device-container-engdevice">
      <div className="device-header-engdevice">
        <div className="skeleton-line-engdevice large-engdevice"></div>
        <div className="skeleton-line-engdevice medium-engdevice"></div>
      </div>
      <div className="stats-cards-engdevice">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="stat-card-engdevice skeleton-card-engdevice">
            <div className="skeleton-line-engdevice small-engdevice"></div>
            <div className="skeleton-line-engdevice large-engdevice"></div>
          </div>
        ))}
      </div>
      <div className="device-filters-engdevice">
        <div className="skeleton-select-engdevice"></div>
        <div className="skeleton-search-engdevice"></div>
      </div>
      <div className="devices-table-container-engdevice">
        <div className="skeleton-table-engdevice">
          <div className="skeleton-table-header-engdevice"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-table-row-engdevice"></div>
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
        <title>IoT Device Data | Engineer Dashboard</title>
      </Helmet>

      <div className="iot-device-container-engdevice">
        <div className="device-header-engdevice">
          <h1>IoT Device Data</h1>
          <p>Monitor IoT device data from your assigned sites</p>
        </div>

        {/* Stats Cards - No Icons */}
        <div className="stats-cards-engdevice">
          <div className="stat-card-engdevice total-engdevice">
            <div className="stat-info-engdevice">
              <span className="stat-value-engdevice">{stats.total}</span>
              <span className="stat-label-engdevice">Total Devices</span>
            </div>
          </div>
          <div className="stat-card-engdevice active-engdevice">
            <div className="stat-info-engdevice">
              <span className="stat-value-engdevice">{stats.active}</span>
              <span className="stat-label-engdevice">Active</span>
            </div>
          </div>
          <div className="stat-card-engdevice collecting-engdevice">
            <div className="stat-info-engdevice">
              <span className="stat-value-engdevice">{stats.collecting}</span>
              <span className="stat-label-engdevice">Collecting Data</span>
            </div>
          </div>
          <div className="stat-card-engdevice completed-engdevice">
            <div className="stat-info-engdevice">
              <span className="stat-value-engdevice">{stats.completed}</span>
              <span className="stat-label-engdevice">Completed</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="device-filters-engdevice">
          <div className="filter-group-engdevice">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Devices</option>
              <option value="active">Active</option>
              <option value="collecting">Collecting Data</option>
              <option value="completed">Completed</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="search-group-engdevice">
            <FaSearch className="search-icon-engdevice" />
            <input
              type="text"
              placeholder="Search by device ID, name, or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Devices Table */}
        <div className="devices-table-container-engdevice">
          <table className="devices-table-engdevice">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Assessment</th>
                <th>Client</th>
                <th>Status</th>
                <th>Battery</th>
                <th>Last Reading</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-state-engdevice">
                    <p>No devices found</p>
                  </td>
                </tr>
              ) : (
                filteredDevices.map(device => {
                  const dataSummary = device.recentData ? getDataSummary(device.recentData) : null;
                  return (
                    <tr key={device._id}>
                      <td className="device-id-engdevice">{device.deviceId}</td>
                      <td><strong>{device.deviceName}</strong></td>
                      <td className="location-cell-engdevice">{device.location || '—'}</td>
                      <td>{device.assessmentReference || '—'}</td>
                      <td>{device.clientName || '—'}</td>
                      <td>{getStatusBadge(device.status)}</td>
                      <td className="battery-cell-engdevice">
                        {getBatteryIcon(device.batteryLevel)}
                        <span>{device.batteryLevel || '—'}%</span>
                      </td>
                      <td>{formatDate(device.lastReading)}</td>
                      <td className="actions-cell-engdevice">
                        <button
                          className="action-btn-engdevice view-engdevice"
                          onClick={() => handleViewDevice(device)}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {(device.status === 'collecting' || device.status === 'active') && (
                          <button
                            className="action-btn-engdevice data-engdevice"
                            onClick={() => handleViewData(device)}
                            title="View Data"
                          >
                            <FaChartLine />
                          </button>
                        )}
                        {device.recentData?.length > 0 && (
                          <button
                            className="action-btn-engdevice export-engdevice"
                            onClick={() => handleExportData(device)}
                            title="Export Data"
                          >
                            <FaDownload />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-engdevice">
            <button
              className="page-btn-engdevice"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft /> Previous
            </button>
            <span className="page-info-engdevice">Page {currentPage} of {totalPages}</span>
            <button
              className="page-btn-engdevice"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}

        {/* Device Details Modal */}
        {showDeviceModal && selectedDevice && (
          <div className="modal-overlay-engdevice" onClick={() => setShowDeviceModal(false)}>
            <div className="modal-content-engdevice" onClick={e => e.stopPropagation()}>
              <button className="modal-close-engdevice" onClick={() => setShowDeviceModal(false)}>×</button>
              <h2>Device Details</h2>

              <div className="device-details-engdevice">
                <div className="detail-section-engdevice">
                  <h3>Device Information</h3>
                  <p><strong>Device ID:</strong> {selectedDevice.deviceId}</p>
                  <p><strong>Name:</strong> {selectedDevice.deviceName}</p>
                  <p><strong>Model:</strong> {selectedDevice.model || 'N/A'}</p>
                  <p><strong>Firmware:</strong> v{selectedDevice.firmwareVersion || '1.0.0'}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedDevice.status)}</p>
                </div>

                <div className="detail-section-engdevice">
                  <h3>Assessment Information</h3>
                  <p><strong>Reference:</strong> {selectedDevice.assessmentReference || '—'}</p>
                  <p><strong>Client:</strong> {selectedDevice.clientName || '—'}</p>
                  <p><strong>Location:</strong> {selectedDevice.location || '—'}</p>
                  <p><strong>Deployed:</strong> {formatDate(selectedDevice.deployedAt)}</p>
                  {selectedDevice.expectedReturn && (
                    <p><strong>Expected Return:</strong> {formatDateOnly(selectedDevice.expectedReturn)}</p>
                  )}
                </div>

                <div className="detail-section-engdevice">
                  <h3>Device Health</h3>
                  <p><strong>Battery Level:</strong> {selectedDevice.batteryLevel || '—'}%</p>
                  <p><strong>Last Heartbeat:</strong> {formatDate(selectedDevice.lastHeartbeat)}</p>
                  <p><strong>Last Reading:</strong> {formatDate(selectedDevice.lastReading)}</p>
                  <p><strong>Total Readings:</strong> {selectedDevice.totalReadings || 0}</p>
                </div>

                {deviceData.length > 0 && (
                  <div className="detail-section-engdevice">
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

              <div className="modal-actions-engdevice">
                {(selectedDevice.status === 'collecting' || selectedDevice.status === 'active') && (
                  <button className="btn-primary-engdevice" onClick={() => {
                    setShowDeviceModal(false);
                    handleViewData(selectedDevice);
                  }}>
                    View Full Data
                  </button>
                )}
                <button className="btn-secondary-engdevice" onClick={() => setShowDeviceModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Device Data Modal */}
        {showDataModal && selectedDevice && (
          <div className="modal-overlay-engdevice" onClick={() => setShowDataModal(false)}>
            <div className="modal-content-engdevice large-engdevice" onClick={e => e.stopPropagation()}>
              <button className="modal-close-engdevice" onClick={() => setShowDataModal(false)}>×</button>
              <h2>Device Data - {selectedDevice.deviceName}</h2>
              <p className="modal-subtitle-engdevice">
                {selectedDevice.assessmentReference} | {selectedDevice.clientName}
              </p>

              <div className="data-summary-engdevice">
                {(() => {
                  const summary = getDataSummary(deviceData);
                  return (
                    <div className="summary-cards-engdevice">
                      <div className="summary-card-engdevice">
                        <span>Avg Power</span>
                        <strong>{summary.avgPower} W</strong>
                      </div>
                      <div className="summary-card-engdevice">
                        <span>Peak Power</span>
                        <strong>{summary.maxPower} W</strong>
                      </div>
                      <div className="summary-card-engdevice">
                        <span>Avg Temp</span>
                        <strong>{summary.avgTemp} °C</strong>
                      </div>
                      <div className="summary-card-engdevice">
                        <span>Readings</span>
                        <strong>{deviceData.length}</strong>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="data-table-container-engdevice">
                <table className="data-table-engdevice">
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
                        <td colSpan="5" className="empty-state-engdevice">No data available</td>
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

              <div className="modal-actions-engdevice">
                <button className="btn-secondary-engdevice" onClick={() => setShowDataModal(false)}>
                  Close
                </button>
                {deviceData.length > 0 && (
                  <button className="btn-primary-engdevice" onClick={() => handleExportData(selectedDevice)}>
                    <FaDownload /> Export CSV
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default IoTDevice;