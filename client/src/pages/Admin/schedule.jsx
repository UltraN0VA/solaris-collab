// pages/Admin/Schedule.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FaCalendarAlt, 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaClock,
  FaUser,
  FaMapMarkerAlt,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaDownload,
  FaEnvelope,
  FaPhone,
  FaUserCog
} from 'react-icons/fa';
import '../../styles/Admin/schedule.css';

const Schedule = () => {
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mock stats data
  const [stats] = useState({
    total: 24,
    scheduled: 12,
    completed: 8,
    cancelled: 4
  });
  
  // Mock appointments data
  const [appointments] = useState([
    {
      id: 1,
      bookingReference: 'ASM-2024-001',
      clientName: 'Juan Dela Cruz',
      clientEmail: 'juan@example.com',
      clientPhone: '09171234567',
      address: '123 Rizal St., Manila',
      assessmentType: 'pre-assessment',
      scheduledDate: '2024-03-25',
      scheduledTime: '09:00 AM',
      engineerName: 'Engr. Maria Santos',
      status: 'scheduled',
      notes: 'Bring IoT device for 7-day monitoring'
    },
    {
      id: 2,
      bookingReference: 'ASM-2024-002',
      clientName: 'Maria Santos',
      clientEmail: 'maria@example.com',
      clientPhone: '09172345678',
      address: '456 Mabini St., Quezon City',
      assessmentType: 'site-assessment',
      scheduledDate: '2024-03-26',
      scheduledTime: '10:30 AM',
      engineerName: 'Engr. Juan Dela Cruz',
      status: 'scheduled',
      notes: 'Customer has large roof area'
    },
    {
      id: 3,
      bookingReference: 'ASM-2024-003',
      clientName: 'Pedro Reyes',
      clientEmail: 'pedro@example.com',
      clientPhone: '09173456789',
      address: '789 Rizal Ave., Pasig City',
      assessmentType: 'pre-assessment',
      scheduledDate: '2024-03-24',
      scheduledTime: '02:00 PM',
      engineerName: 'Engr. Maria Santos',
      status: 'completed',
      notes: 'Assessment completed successfully'
    },
    {
      id: 4,
      bookingReference: 'ASM-2024-004',
      clientName: 'Ana Flores',
      clientEmail: 'ana@example.com',
      clientPhone: '09174567890',
      address: '321 Bonifacio St., Makati',
      assessmentType: 'site-assessment',
      scheduledDate: '2024-03-27',
      scheduledTime: '01:00 PM',
      engineerName: 'Engr. Juan Dela Cruz',
      status: 'scheduled',
      notes: 'Customer wants hybrid system'
    },
    {
      id: 5,
      bookingReference: 'ASM-2024-005',
      clientName: 'Carlos Lopez',
      clientEmail: 'carlos@example.com',
      clientPhone: '09175678901',
      address: '555 EDSA, Mandaluyong',
      assessmentType: 'pre-assessment',
      scheduledDate: '2024-03-23',
      scheduledTime: '11:00 AM',
      engineerName: 'Engr. Maria Santos',
      status: 'cancelled',
      notes: 'Cancelled by client'
    }
  ]);

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    address: '',
    assessmentType: 'pre-assessment',
    scheduledDate: '',
    scheduledTime: '',
    engineerId: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock engineers
  const engineers = [
    { id: 1, name: 'Engr. Juan Dela Cruz' },
    { id: 2, name: 'Engr. Maria Santos' },
    { id: 3, name: 'Engr. Pedro Reyes' }
  ];

  const handleOpenCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail,
      clientPhone: appointment.clientPhone,
      address: appointment.address,
      assessmentType: appointment.assessmentType,
      scheduledDate: appointment.scheduledDate,
      scheduledTime: appointment.scheduledTime,
      engineerId: engineers.find(e => e.name === appointment.engineerName)?.id || '',
      notes: appointment.notes || ''
    });
    setShowEditModal(true);
  };

  const handleOpenViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleCreateAppointment = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      alert('Appointment scheduled successfully!');
      setShowCreateModal(false);
      resetForm();
      setIsSubmitting(false);
    }, 1000);
  };

  const handleUpdateAppointment = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      alert('Appointment updated successfully!');
      setShowEditModal(false);
      resetForm();
      setIsSubmitting(false);
    }, 1000);
  };

  const handleCancelAppointment = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      alert('Appointment cancelled successfully!');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.clientName) errors.clientName = 'Client name is required';
    if (!formData.clientEmail) errors.clientEmail = 'Email is required';
    if (!formData.clientPhone) errors.clientPhone = 'Phone number is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.scheduledDate) errors.scheduledDate = 'Date is required';
    if (!formData.scheduledTime) errors.scheduledTime = 'Time is required';
    if (!formData.engineerId) errors.engineerId = 'Engineer is required';
    return errors;
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      address: '',
      assessmentType: 'pre-assessment',
      scheduledDate: '',
      scheduledTime: '',
      engineerId: '',
      notes: ''
    });
    setFormErrors({});
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'scheduled':
        return <span className="status-badge-adminschedule scheduled-adminschedule">Scheduled</span>;
      case 'completed':
        return <span className="status-badge-adminschedule completed-adminschedule">Completed</span>;
      case 'cancelled':
        return <span className="status-badge-adminschedule cancelled-adminschedule">Cancelled</span>;
      default:
        return <span className="status-badge-adminschedule">{status}</span>;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return appointment.clientName.toLowerCase().includes(searchLower) ||
           appointment.bookingReference.toLowerCase().includes(searchLower) ||
           appointment.address.toLowerCase().includes(searchLower);
  });

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  const totalPages = Math.ceil(filteredAppointments.length / 10);

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="schedule-container-adminschedule">
      <div className="schedule-header-adminschedule">
        <div className="skeleton-line-adminschedule large-adminschedule"></div>
        <div className="skeleton-line-adminschedule medium-adminschedule"></div>
      </div>
      <div className="stats-cards-adminschedule">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="stat-card-adminschedule skeleton-card-adminschedule">
            <div className="skeleton-line-adminschedule small-adminschedule"></div>
            <div className="skeleton-line-adminschedule large-adminschedule"></div>
          </div>
        ))}
      </div>
      <div className="filters-section-adminschedule">
        <div className="skeleton-tabs-adminschedule"></div>
        <div className="skeleton-search-adminschedule"></div>
      </div>
      <div className="table-container-adminschedule">
        <div className="skeleton-table-adminschedule">
          <div className="skeleton-table-header-adminschedule"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-table-row-adminschedule"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <Helmet>
        <title>Schedule Management | Admin | Salfer Engineering</title>
      </Helmet>

      <div className="schedule-container-adminschedule">
        {/* Header */}
        <div className="schedule-header-adminschedule">
          <div>
            <h1>Schedule Management</h1>
            <p>Manage and track all site assessment appointments</p>
          </div>
          <button className="create-btn-adminschedule" onClick={handleOpenCreateModal}>
            <FaPlus /> New Appointment
          </button>
        </div>

        {/* Stats Cards - Icons Removed */}
        <div className="stats-cards-adminschedule">
          <div className="stat-card-adminschedule total-adminschedule">
            <div className="stat-info-adminschedule">
              <span className="stat-value-adminschedule">{stats.total}</span>
              <span className="stat-label-adminschedule">Total</span>
            </div>
          </div>
          <div className="stat-card-adminschedule scheduled-adminschedule">
            <div className="stat-info-adminschedule">
              <span className="stat-value-adminschedule">{stats.scheduled}</span>
              <span className="stat-label-adminschedule">Scheduled</span>
            </div>
          </div>
          <div className="stat-card-adminschedule completed-adminschedule">
            <div className="stat-info-adminschedule">
              <span className="stat-value-adminschedule">{stats.completed}</span>
              <span className="stat-label-adminschedule">Completed</span>
            </div>
          </div>
          <div className="stat-card-adminschedule cancelled-adminschedule">
            <div className="stat-info-adminschedule">
              <span className="stat-value-adminschedule">{stats.cancelled}</span>
              <span className="stat-label-adminschedule">Cancelled</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="filters-section-adminschedule">
          <div className="filter-tabs-adminschedule">
            <button 
              className={`filter-tab-adminschedule ${filter === 'all' ? 'active-adminschedule' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-tab-adminschedule ${filter === 'scheduled' ? 'active-adminschedule' : ''}`}
              onClick={() => setFilter('scheduled')}
            >
              Scheduled
            </button>
            <button 
              className={`filter-tab-adminschedule ${filter === 'completed' ? 'active-adminschedule' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
            <button 
              className={`filter-tab-adminschedule ${filter === 'cancelled' ? 'active-adminschedule' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>

          <div className="search-box-adminschedule">
            <FaSearch className="search-icon-adminschedule" />
            <input
              type="text"
              placeholder="Search by client, reference, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Appointments Table */}
        <div className="table-container-adminschedule">
          <table className="schedule-table-adminschedule">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Client</th>
                <th>Address</th>
                <th>Date</th>
                <th>Time</th>
                <th>Engineer</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state-adminschedule">
                    <p>No appointments found</p>
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map(appointment => (
                  <tr key={appointment.id}>
                    <td className="ref-cell-adminschedule">{appointment.bookingReference}</td>
                    <td>
                      <div className="client-info-adminschedule">
                        <strong>{appointment.clientName}</strong>
                        <small>{appointment.clientPhone}</small>
                      </div>
                    </td>
                    <td className="address-cell-adminschedule">{appointment.address}</td>
                    <td>{formatDate(appointment.scheduledDate)}</td>
                    <td>{appointment.scheduledTime}</td>
                    <td>{appointment.engineerName}</td>
                    <td>{getStatusBadge(appointment.status)}</td>
                    <td className="actions-cell-adminschedule">
                      <button 
                        className="action-btn-adminschedule view-adminschedule"
                        onClick={() => handleOpenViewModal(appointment)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {appointment.status === 'scheduled' && (
                        <>
                          <button 
                            className="action-btn-adminschedule edit-adminschedule"
                            onClick={() => handleOpenEditModal(appointment)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="action-btn-adminschedule cancel-adminschedule"
                            onClick={() => handleCancelAppointment(appointment.id)}
                            title="Cancel"
                          >
                            <FaTimesCircle />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-adminschedule">
            <button 
              className="page-btn-adminschedule"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft /> Previous
            </button>
            <span className="page-info-adminschedule">Page {currentPage} of {totalPages}</span>
            <button 
              className="page-btn-adminschedule"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedAppointment && (
          <div className="modal-overlay-adminschedule" onClick={() => setShowViewModal(false)}>
            <div className="modal-content-adminschedule" onClick={e => e.stopPropagation()}>
              <div className="modal-header-adminschedule">
                <h3>Appointment Details</h3>
                <button className="modal-close-adminschedule" onClick={() => setShowViewModal(false)}>×</button>
              </div>
              
              <div className="modal-body-adminschedule">
                <div className="detail-section-adminschedule">
                  <h4>Client Information</h4>
                  <div className="detail-row-adminschedule">
                    <span>Name:</span>
                    <strong>{selectedAppointment.clientName}</strong>
                  </div>
                  <div className="detail-row-adminschedule">
                    <span>Email:</span>
                    <strong>{selectedAppointment.clientEmail}</strong>
                  </div>
                  <div className="detail-row-adminschedule">
                    <span>Phone:</span>
                    <strong>{selectedAppointment.clientPhone}</strong>
                  </div>
                  <div className="detail-row-adminschedule">
                    <span>Address:</span>
                    <strong>{selectedAppointment.address}</strong>
                  </div>
                </div>

                <div className="detail-section-adminschedule">
                  <h4>Assessment Details</h4>
                  <div className="detail-row-adminschedule">
                    <span>Reference:</span>
                    <strong>{selectedAppointment.bookingReference}</strong>
                  </div>
                  <div className="detail-row-adminschedule">
                    <span>Type:</span>
                    <strong>{selectedAppointment.assessmentType === 'pre-assessment' ? 'Pre-Assessment' : 'Site Assessment'}</strong>
                  </div>
                  <div className="detail-row-adminschedule">
                    <span>Date:</span>
                    <strong>{formatDate(selectedAppointment.scheduledDate)}</strong>
                  </div>
                  <div className="detail-row-adminschedule">
                    <span>Time:</span>
                    <strong>{selectedAppointment.scheduledTime}</strong>
                  </div>
                  <div className="detail-row-adminschedule">
                    <span>Engineer:</span>
                    <strong>{selectedAppointment.engineerName}</strong>
                  </div>
                  <div className="detail-row-adminschedule">
                    <span>Status:</span>
                    <strong>{getStatusBadge(selectedAppointment.status)}</strong>
                  </div>
                </div>

                {selectedAppointment.notes && (
                  <div className="detail-section-adminschedule">
                    <h4>Notes</h4>
                    <p className="notes-text-adminschedule">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>

              <div className="modal-actions-adminschedule">
                <button className="cancel-btn-adminschedule" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="modal-overlay-adminschedule" onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            resetForm();
          }}>
            <div className="modal-content-adminschedule modal-large-adminschedule" onClick={e => e.stopPropagation()}>
              <div className="modal-header-adminschedule">
                <h3>{showCreateModal ? 'Schedule New Appointment' : 'Edit Appointment'}</h3>
                <button className="modal-close-adminschedule" onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}>×</button>
              </div>
              
              <div className="modal-body-adminschedule">
                <div className="form-row-adminschedule">
                  <div className="form-group-adminschedule">
                    <label>Client Name *</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className={formErrors.clientName ? 'error-adminschedule' : ''}
                    />
                    {formErrors.clientName && <span className="error-text-adminschedule">{formErrors.clientName}</span>}
                  </div>
                  <div className="form-group-adminschedule">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className={formErrors.clientEmail ? 'error-adminschedule' : ''}
                    />
                    {formErrors.clientEmail && <span className="error-text-adminschedule">{formErrors.clientEmail}</span>}
                  </div>
                </div>

                <div className="form-row-adminschedule">
                  <div className="form-group-adminschedule">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className={formErrors.clientPhone ? 'error-adminschedule' : ''}
                    />
                    {formErrors.clientPhone && <span className="error-text-adminschedule">{formErrors.clientPhone}</span>}
                  </div>
                  <div className="form-group-adminschedule">
                    <label>Assessment Type</label>
                    <select
                      value={formData.assessmentType}
                      onChange={(e) => setFormData({ ...formData, assessmentType: e.target.value })}
                    >
                      <option value="pre-assessment">Pre-Assessment</option>
                      <option value="site-assessment">Site Assessment</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-adminschedule">
                  <label>Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={formErrors.address ? 'error-adminschedule' : ''}
                  />
                  {formErrors.address && <span className="error-text-adminschedule">{formErrors.address}</span>}
                </div>

                <div className="form-row-adminschedule">
                  <div className="form-group-adminschedule">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className={formErrors.scheduledDate ? 'error-adminschedule' : ''}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {formErrors.scheduledDate && <span className="error-text-adminschedule">{formErrors.scheduledDate}</span>}
                  </div>
                  <div className="form-group-adminschedule">
                    <label>Time *</label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className={formErrors.scheduledTime ? 'error-adminschedule' : ''}
                    />
                    {formErrors.scheduledTime && <span className="error-text-adminschedule">{formErrors.scheduledTime}</span>}
                  </div>
                </div>

                <div className="form-group-adminschedule">
                  <label>Assign Engineer *</label>
                  <select
                    value={formData.engineerId}
                    onChange={(e) => setFormData({ ...formData, engineerId: e.target.value })}
                    className={formErrors.engineerId ? 'error-adminschedule' : ''}
                  >
                    <option value="">Select an engineer...</option>
                    {engineers.map(eng => (
                      <option key={eng.id} value={eng.id}>{eng.name}</option>
                    ))}
                  </select>
                  {formErrors.engineerId && <span className="error-text-adminschedule">{formErrors.engineerId}</span>}
                </div>

                <div className="form-group-adminschedule">
                  <label>Notes (Optional)</label>
                  <textarea
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any special instructions or notes..."
                  />
                </div>
              </div>

              <div className="modal-actions-adminschedule">
                <button className="cancel-btn-adminschedule" onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button 
                  className="save-btn-adminschedule" 
                  onClick={showCreateModal ? handleCreateAppointment : handleUpdateAppointment}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (showCreateModal ? 'Schedule Appointment' : 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Schedule;