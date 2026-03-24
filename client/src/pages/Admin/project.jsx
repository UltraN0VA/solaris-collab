// pages/Admin/Project.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { 
  FaSearch, 
  FaEye, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner,
  FaMoneyBillWave,
  FaClock,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaUserCog,
  FaCheck,
  FaTools
} from 'react-icons/fa';
import '../../styles/Admin/project.css';

const ProjectManagement = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [engineers, setEngineers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    quoted: 0,
    approved: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    engineerId: '',
    assignNotes: '',
    paymentAmount: '',
    paymentMethod: 'cash',
    paymentReference: '',
    newStatus: '',
    statusNotes: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchEngineers();
    fetchStats();
  }, [filter, currentPage]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: filter === 'all' ? undefined : filter, page: currentPage, limit: 10 }
      });
      setProjects(response.data.projects || []);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
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

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedProject || !formData.newStatus) return;

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/projects/${selectedProject._id}/status`,
        { status: formData.newStatus, notes: formData.statusNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Project status updated to ${formData.newStatus}`);
      setShowStatusModal(false);
      setSelectedProject(null);
      setFormData({ ...formData, newStatus: '', statusNotes: '' });
      fetchProjects();
      fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignEngineer = async () => {
    if (!selectedProject || !formData.engineerId) return;

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/projects/${selectedProject._id}/assign-engineer`,
        { engineerId: formData.engineerId, notes: formData.assignNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Engineer assigned successfully');
      setShowAssignModal(false);
      setSelectedProject(null);
      setFormData({ ...formData, engineerId: '', assignNotes: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error assigning engineer:', error);
      alert('Failed to assign engineer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedProject || !formData.paymentAmount) return;

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/projects/${selectedProject._id}/payment`,
        { amount: parseFloat(formData.paymentAmount), method: formData.paymentMethod, reference: formData.paymentReference },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Payment recorded successfully');
      setShowPaymentModal(false);
      setSelectedProject(null);
      setFormData({ ...formData, paymentAmount: '', paymentMethod: 'cash', paymentReference: '' });
      fetchProjects();
      fetchStats();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      'quoted': <span className="status-badge-adminprojectman quoted-adminprojectman">Quoted</span>,
      'approved': <span className="status-badge-adminprojectman approved-adminprojectman">Approved</span>,
      'initial_paid': <span className="status-badge-adminprojectman initial-paid-adminprojectman">Initial Paid</span>,
      'in_progress': <span className="status-badge-adminprojectman in-progress-adminprojectman">In Progress</span>,
      'progress_paid': <span className="status-badge-adminprojectman progress-paid-adminprojectman">Progress Paid</span>,
      'completed': <span className="status-badge-adminprojectman completed-adminprojectman">Completed</span>,
      'cancelled': <span className="status-badge-adminprojectman cancelled-adminprojectman">Cancelled</span>
    };
    return badges[status] || <span className="status-badge-adminprojectman">{status}</span>;
  };

  const getProgressPercentage = (project) => {
    if (!project.totalCost || project.totalCost === 0) return 0;
    return Math.round((project.amountPaid / project.totalCost) * 100);
  };

  const getPaymentScheduleStatus = (payment) => {
    if (payment.status === 'paid') return 'Paid';
    if (payment.status === 'overdue') return 'Overdue';
    return 'Pending';
  };

  const filteredProjects = projects.filter(project => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return project.projectName?.toLowerCase().includes(searchLower) ||
           project.projectReference?.toLowerCase().includes(searchLower) ||
           project.clientId?.contactFirstName?.toLowerCase().includes(searchLower) ||
           project.clientId?.contactLastName?.toLowerCase().includes(searchLower);
  });

  // Skeleton Loader
  const SkeletonLoader = () => (
    <div className="project-management-adminprojectman">
      <div className="project-header-adminprojectman">
        <div className="skeleton-line-adminprojectman large-adminprojectman"></div>
        <div className="skeleton-line-adminprojectman medium-adminprojectman"></div>
      </div>
      <div className="project-stats-adminprojectman">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="stat-card-adminprojectman skeleton-card-adminprojectman">
            <div className="skeleton-line-adminprojectman small-adminprojectman"></div>
            <div className="skeleton-line-adminprojectman large-adminprojectman"></div>
          </div>
        ))}
      </div>
      <div className="project-filters-adminprojectman">
        <div className="skeleton-select-adminprojectman"></div>
        <div className="skeleton-search-adminprojectman"></div>
      </div>
      <div className="project-table-container-adminprojectman">
        <div className="skeleton-table-adminprojectman">
          <div className="skeleton-table-header-adminprojectman"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-table-row-adminprojectman"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && projects.length === 0) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <Helmet>
        <title>Project Management | Admin | Salfer Engineering</title>
      </Helmet>

      <div className="project-management-adminprojectman">
        {/* Header */}
        <div className="project-header-adminprojectman">
          <div>
            <h1>Project Management</h1>
            <p>Manage solar installation projects from quotation to completion</p>
          </div>
        </div>

        {/* Stats Cards - No Icons */}
        <div className="project-stats-adminprojectman">
          <div className="stat-card-adminprojectman total-adminprojectman">
            <div className="stat-info-adminprojectman">
              <span className="stat-value-adminprojectman">{stats.total}</span>
              <span className="stat-label-adminprojectman">Total Projects</span>
            </div>
          </div>
          <div className="stat-card-adminprojectman quoted-adminprojectman">
            <div className="stat-info-adminprojectman">
              <span className="stat-value-adminprojectman">{stats.quoted}</span>
              <span className="stat-label-adminprojectman">Quoted</span>
            </div>
          </div>
          <div className="stat-card-adminprojectman in-progress-adminprojectman">
            <div className="stat-info-adminprojectman">
              <span className="stat-value-adminprojectman">{stats.inProgress}</span>
              <span className="stat-label-adminprojectman">In Progress</span>
            </div>
          </div>
          <div className="stat-card-adminprojectman completed-adminprojectman">
            <div className="stat-info-adminprojectman">
              <span className="stat-value-adminprojectman">{stats.completed}</span>
              <span className="stat-label-adminprojectman">Completed</span>
            </div>
          </div>
          <div className="stat-card-adminprojectman revenue-adminprojectman">
            <div className="stat-info-adminprojectman">
              <span className="stat-value-adminprojectman">{formatCurrency(stats.totalRevenue)}</span>
              <span className="stat-label-adminprojectman">Total Revenue</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="project-filters-adminprojectman">
          <div className="filter-group-adminprojectman">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="quoted">Quoted</option>
              <option value="approved">Approved</option>
              <option value="initial_paid">Initial Paid</option>
              <option value="in_progress">In Progress</option>
              <option value="progress_paid">Progress Paid</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="search-group-adminprojectman">
            <FaSearch className="search-icon-adminprojectman" />
            <input
              type="text"
              placeholder="Search by project name, reference or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Projects Table */}
        <div className="project-table-container-adminprojectman">
          <table className="project-table-adminprojectman">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>System Size</th>
                <th>Total Cost</th>
                <th>Paid</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state-adminprojectman">
                    <p>No projects found</p>
                  </td>
                </tr>
              ) : (
                filteredProjects.map(project => (
                  <tr key={project._id}>
                    <td className="project-cell-adminprojectman">
                      <div className="project-name-adminprojectman">{project.projectName}</div>
                      <div className="project-ref-adminprojectman">{project.projectReference}</div>
                    </td>
                    <td>
                      <div><strong>{project.clientId?.contactFirstName} {project.clientId?.contactLastName}</strong></div>
                      <div><small>{project.clientId?.contactNumber}</small></div>
                    </td>
                    <td>{project.systemSize} kW</td>
                    <td className="amount-adminprojectman">{formatCurrency(project.totalCost)}</td>
                    <td className="amount-adminprojectman">{formatCurrency(project.amountPaid)}</td>
                    <td className="progress-cell-adminprojectman">
                      <div className="progress-bar-container-adminprojectman">
                        <div className="progress-bar-adminprojectman" style={{ width: `${getProgressPercentage(project)}%` }}></div>
                      </div>
                      <span className="progress-text-adminprojectman">{getProgressPercentage(project)}%</span>
                    </td>
                    <td>{getStatusBadge(project.status)}</td>
                    <td className="actions-cell-adminprojectman">
                      <button 
                        className="action-btn-adminprojectman view-adminprojectman"
                        onClick={() => { setSelectedProject(project); setShowDetailModal(true); }}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {project.status === 'quoted' && (
                        <button 
                          className="action-btn-adminprojectman approve-adminprojectman"
                          onClick={() => { setSelectedProject(project); setFormData({ ...formData, newStatus: 'approved' }); setShowStatusModal(true); }}
                          title="Approve Project"
                        >
                          <FaCheck />
                        </button>
                      )}
                      {project.status === 'approved' && (
                        <button 
                          className="action-btn-adminprojectman assign-adminprojectman"
                          onClick={() => { setSelectedProject(project); setShowAssignModal(true); }}
                          title="Assign Engineer"
                        >
                          <FaUserCog />
                        </button>
                      )}
                      {(project.status === 'initial_paid' || project.status === 'in_progress') && (
                        <button 
                          className="action-btn-adminprojectman payment-adminprojectman"
                          onClick={() => { setSelectedProject(project); setShowPaymentModal(true); }}
                          title="Record Payment"
                        >
                          <FaMoneyBillWave />
                        </button>
                      )}
                      {project.status === 'in_progress' && (
                        <button 
                          className="action-btn-adminprojectman complete-adminprojectman"
                          onClick={() => { setSelectedProject(project); setFormData({ ...formData, newStatus: 'completed' }); setShowStatusModal(true); }}
                          title="Mark Complete"
                        >
                          <FaCheckCircle />
                        </button>
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
          <div className="pagination-adminprojectman">
            <button 
              className="page-btn-adminprojectman"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft /> Previous
            </button>
            <span className="page-info-adminprojectman">Page {currentPage} of {totalPages}</span>
            <button 
              className="page-btn-adminprojectman"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedProject && (
          <div className="modal-overlay-adminprojectman" onClick={() => setShowDetailModal(false)}>
            <div className="modal-content-adminprojectman detail-modal-adminprojectman" onClick={e => e.stopPropagation()}>
              <h3>Project Details</h3>
              
              <div className="detail-section-adminprojectman">
                <h4>Project Information</h4>
                <p><strong>Name:</strong> {selectedProject.projectName}</p>
                <p><strong>Reference:</strong> {selectedProject.projectReference}</p>
                <p><strong>System:</strong> {selectedProject.systemSize} kW - {selectedProject.systemType}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedProject.status)}</p>
                <p><strong>Created:</strong> {formatDate(selectedProject.createdAt)}</p>
              </div>

              <div className="detail-section-adminprojectman">
                <h4>Client Information</h4>
                <p><strong>Name:</strong> {selectedProject.clientId?.contactFirstName} {selectedProject.clientId?.contactLastName}</p>
                <p><strong>Contact:</strong> {selectedProject.clientId?.contactNumber}</p>
                <p><strong>Email:</strong> {selectedProject.clientId?.userId?.email}</p>
                <p><strong>Address:</strong> {selectedProject.addressId?.houseOrBuilding} {selectedProject.addressId?.street}, {selectedProject.addressId?.barangay}, {selectedProject.addressId?.cityMunicipality}</p>
              </div>

              <div className="detail-section-adminprojectman">
                <h4>Financial Summary</h4>
                <p><strong>Total Cost:</strong> {formatCurrency(selectedProject.totalCost)}</p>
                <p><strong>Amount Paid:</strong> {formatCurrency(selectedProject.amountPaid)}</p>
                <p><strong>Balance:</strong> {formatCurrency(selectedProject.balance)}</p>
                <div className="progress-bar-container-adminprojectman large-adminprojectman">
                  <div className="progress-bar-adminprojectman" style={{ width: `${getProgressPercentage(selectedProject)}%` }}></div>
                </div>
              </div>

              {selectedProject.paymentSchedule?.length > 0 && (
                <div className="detail-section-adminprojectman">
                  <h4>Payment Schedule</h4>
                  <table className="payment-schedule-table-adminprojectman">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.paymentSchedule.map((payment, idx) => (
                        <tr key={idx}>
                          <td className="capitalize-adminprojectman">{payment.type}</td>
                          <td>{formatCurrency(payment.amount)}</td>
                          <td>{formatDate(payment.dueDate)}</td>
                          <td>{getPaymentScheduleStatus(payment)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedProject.assignedEngineerId && (
                <div className="detail-section-adminprojectman">
                  <h4>Assigned Engineer</h4>
                  <p><strong>Name:</strong> {selectedProject.assignedEngineerId?.firstName} {selectedProject.assignedEngineerId?.lastName}</p>
                  <p><strong>Email:</strong> {selectedProject.assignedEngineerId?.email}</p>
                </div>
              )}

              {selectedProject.installationNotes && (
                <div className="detail-section-adminprojectman">
                  <h4>Installation Notes</h4>
                  <p>{selectedProject.installationNotes}</p>
                </div>
              )}

              <div className="modal-actions-adminprojectman">
                <button className="cancel-btn-adminprojectman" onClick={() => setShowDetailModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedProject && (
          <div className="modal-overlay-adminprojectman" onClick={() => setShowStatusModal(false)}>
            <div className="modal-content-adminprojectman" onClick={e => e.stopPropagation()}>
              <h3>Update Project Status</h3>
              <p><strong>Project:</strong> {selectedProject.projectName}</p>
              <p><strong>Current Status:</strong> {getStatusBadge(selectedProject.status)}</p>
              
              <div className="form-group-adminprojectman">
                <label>New Status</label>
                <select value={formData.newStatus} onChange={(e) => setFormData({ ...formData, newStatus: e.target.value })}>
                  <option value="">Select status...</option>
                  {selectedProject.status === 'quoted' && <option value="approved">Approve Project</option>}
                  {selectedProject.status === 'in_progress' && <option value="completed">Mark as Completed</option>}
                  {selectedProject.status !== 'cancelled' && <option value="cancelled">Cancel Project</option>}
                </select>
              </div>

              <div className="form-group-adminprojectman">
                <label>Notes (Optional)</label>
                <textarea rows="3" value={formData.statusNotes} onChange={(e) => setFormData({ ...formData, statusNotes: e.target.value })} placeholder="Add notes about this status change..." />
              </div>

              <div className="modal-actions-adminprojectman">
                <button className="cancel-btn-adminprojectman" onClick={() => setShowStatusModal(false)}>Cancel</button>
                <button className="update-btn-adminprojectman" onClick={handleUpdateStatus} disabled={!formData.newStatus || isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Engineer Modal */}
        {showAssignModal && selectedProject && (
          <div className="modal-overlay-adminprojectman" onClick={() => setShowAssignModal(false)}>
            <div className="modal-content-adminprojectman" onClick={e => e.stopPropagation()}>
              <h3>Assign Engineer</h3>
              <p><strong>Project:</strong> {selectedProject.projectName}</p>
              
              <div className="form-group-adminprojectman">
                <label>Select Engineer</label>
                <select value={formData.engineerId} onChange={(e) => setFormData({ ...formData, engineerId: e.target.value })}>
                  <option value="">Select an engineer...</option>
                  {engineers.map(eng => (
                    <option key={eng._id} value={eng._id}>{eng.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group-adminprojectman">
                <label>Notes (Optional)</label>
                <textarea rows="3" value={formData.assignNotes} onChange={(e) => setFormData({ ...formData, assignNotes: e.target.value })} placeholder="Add notes for the engineer..." />
              </div>

              <div className="modal-actions-adminprojectman">
                <button className="cancel-btn-adminprojectman" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button className="assign-btn-adminprojectman" onClick={handleAssignEngineer} disabled={!formData.engineerId || isSubmitting}>
                  {isSubmitting ? 'Assigning...' : 'Assign Engineer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedProject && (
          <div className="modal-overlay-adminprojectman" onClick={() => setShowPaymentModal(false)}>
            <div className="modal-content-adminprojectman" onClick={e => e.stopPropagation()}>
              <h3>Record Payment</h3>
              <p><strong>Project:</strong> {selectedProject.projectName}</p>
              <p><strong>Total Cost:</strong> {formatCurrency(selectedProject.totalCost)}</p>
              <p><strong>Amount Paid:</strong> {formatCurrency(selectedProject.amountPaid)}</p>
              <p><strong>Balance:</strong> {formatCurrency(selectedProject.balance)}</p>
              
              <div className="form-group-adminprojectman">
                <label>Payment Amount *</label>
                <input type="number" value={formData.paymentAmount} onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })} placeholder="Enter amount" />
              </div>

              <div className="form-group-adminprojectman">
                <label>Payment Method</label>
                <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="gcash">GCash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div className="form-group-adminprojectman">
                <label>Reference Number</label>
                <input type="text" value={formData.paymentReference} onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })} placeholder="Transaction reference" />
              </div>

              <div className="modal-actions-adminprojectman">
                <button className="cancel-btn-adminprojectman" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button className="record-btn-adminprojectman" onClick={handleRecordPayment} disabled={!formData.paymentAmount || isSubmitting}>
                  {isSubmitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectManagement;