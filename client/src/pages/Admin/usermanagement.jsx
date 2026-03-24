// pages/Admin/UserManagement.jsx - Updated with password reset in edit mode
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import {
  FaUsers,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaUserCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaUserCog,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaBuilding,
  FaBan,
  FaCheck,
  FaExclamationTriangle,
  FaKey,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import '../../styles/Admin/userManagement.css';

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newThisMonth: 0,
    usersWithSetup: 0,
    byRole: { admin: 0, engineer: 0, user: 0 }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view, edit, create
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'user',
    firstName: '',
    lastName: '',
    contactNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filterRole, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          role: filterRole === 'all' ? undefined : filterRole,
          page: currentPage,
          limit: 10
        }
      });
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return user.fullName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.clientInfo?.contactNumber?.includes(searchTerm);
  });

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      fullName: '',
      email: '',
      role: 'user',
      firstName: '',
      lastName: '',
      contactNumber: '',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setShowUserModal(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      role: user.role || 'user',
      firstName: user.clientInfo?.firstName || '',
      lastName: user.clientInfo?.lastName || '',
      contactNumber: user.clientInfo?.contactNumber || '',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setShowUserModal(true);
  };

  const handleOpenViewModal = (user) => {
    setModalMode('view');
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleOpenPasswordModal = (user) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      password: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    setShowPasswordModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (modalMode === 'create') {
      if (!formData.email) errors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
      if (!formData.password) errors.password = 'Password is required';
      if (formData.password && formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.fullName && (!formData.firstName || !formData.lastName)) {
      errors.name = 'Full name or first/last name is required';
    }
    return errors;
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!formData.password) errors.password = 'New password is required';
    if (formData.password && formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handleResetPassword = async () => {
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${selectedUser._id}/reset-password`,
        { password: formData.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Password reset successfully!');
        setShowPasswordModal(false);
        setFormData({ ...formData, password: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveUser = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      let response;

      if (modalMode === 'create') {
        response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/users`,
          {
            email: formData.email,
            password: formData.password,
            role: formData.role,
            fullName: formData.fullName || `${formData.firstName} ${formData.lastName}`,
            firstName: formData.firstName,
            lastName: formData.lastName,
            contactNumber: formData.contactNumber
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const updatePayload = {
          fullName: formData.fullName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          contactNumber: formData.contactNumber
        };

        response = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${selectedUser._id}`,
          updatePayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (response.data.success) {
        fetchUsers();
        fetchStats();
        setShowUserModal(false);
        alert(modalMode === 'create' ? 'User created successfully!' : 'User updated successfully!');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${user._id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchUsers();
        fetchStats();
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${selectedUser._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchUsers();
        fetchStats();
        setShowDeleteConfirm(false);
        setSelectedUser(null);
        alert('User deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: <span className="role-badge admin">Admin</span>,
      engineer: <span className="role-badge engineer">Engineer</span>,
      user: <span className="role-badge user">Customer</span>
    };
    return badges[role] || <span className="role-badge">{role}</span>;
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return <span className="status-badge active"><FaCheckCircle /> Active</span>;
    }
    return <span className="status-badge inactive"><FaTimesCircle /> Inactive</span>;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="user-management-loading">
        <FaSpinner className="spinner" />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>User Management | Admin | Salfer Engineering</title>
      </Helmet>

      <div className="user-management">
        {/* Header */}
        <div className="user-management-header">
          <div>
            <h1><FaUsers /> User Management</h1>
            <p>Manage system users, roles, and permissions</p>
          </div>
          <button className="create-user-btn" onClick={handleOpenCreateModal}>
            <FaUserPlus /> Create New User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="user-stats-cards">
          <div className="stat-card total">
            <div className="stat-icon"><FaUsers /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Users</span>
            </div>
          </div>
          <div className="stat-card active">
            <div className="stat-icon"><FaCheckCircle /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.activeUsers}</span>
              <span className="stat-label">Active Users</span>
            </div>
          </div>
          <div className="stat-card inactive">
            <div className="stat-icon"><FaTimesCircle /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.inactiveUsers}</span>
              <span className="stat-label">Inactive Users</span>
            </div>
          </div>
          <div className="stat-card new">
            <div className="stat-icon"><FaCalendarAlt /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.newThisMonth}</span>
              <span className="stat-label">New This Month</span>
            </div>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="role-distribution">
          <h3>Role Distribution</h3>
          <div className="role-bars">
            <div className="role-bar-item">
              <span className="role-label">Admin</span>
              <div className="role-bar-container">
                <div className="role-bar admin" style={{ width: `${(stats.byRole.admin / stats.total) * 100 || 0}%` }}></div>
              </div>
              <span className="role-count">{stats.byRole.admin || 0}</span>
            </div>
            <div className="role-bar-item">
              <span className="role-label">Engineer</span>
              <div className="role-bar-container">
                <div className="role-bar engineer" style={{ width: `${(stats.byRole.engineer / stats.total) * 100 || 0}%` }}></div>
              </div>
              <span className="role-count">{stats.byRole.engineer || 0}</span>
            </div>
            <div className="role-bar-item">
              <span className="role-label">Customer</span>
              <div className="role-bar-container">
                <div className="role-bar user" style={{ width: `${(stats.byRole.user / stats.total) * 100 || 0}%` }}></div>
              </div>
              <span className="role-count">{stats.byRole.user || 0}</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="user-filters-section">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filterRole === 'all' ? 'active' : ''}`}
              onClick={() => setFilterRole('all')}
            >
              All Users
            </button>
            <button
              className={`filter-tab ${filterRole === 'admin' ? 'active' : ''}`}
              onClick={() => setFilterRole('admin')}
            >
              Admins
            </button>
            <button
              className={`filter-tab ${filterRole === 'engineer' ? 'active' : ''}`}
              onClick={() => setFilterRole('engineer')}
            >
              Engineers
            </button>
            <button
              className={`filter-tab ${filterRole === 'user' ? 'active' : ''}`}
              onClick={() => setFilterRole('user')}
            >
              Customers
            </button>
          </div>

          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or contact number..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <FaUsers className="empty-icon" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td className="user-cell">
                      <div className="user-avatar">
                        {user.clientInfo?.firstName ? (
                          <div className="avatar-initials">
                            {user.clientInfo.firstName[0]}{user.clientInfo.lastName?.[0]}
                          </div>
                        ) : (
                          <FaUserCircle />
                        )}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.fullName}</div>
                        {user.clientInfo?.firstName && (
                          <div className="user-detail">
                            {user.clientInfo.firstName} {user.clientInfo.lastName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="email-cell">
                      <FaEnvelope className="email-icon" />
                      {user.email}
                    </td>
                    <td className="contact-cell">
                      {user.clientInfo?.contactNumber || '—'}
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{getStatusBadge(user.isActive)}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastLogin)}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn view"
                        onClick={() => handleOpenViewModal(user)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => handleOpenEditModal(user)}
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn reset-password"
                        onClick={() => handleOpenPasswordModal(user)}
                        title="Reset Password"
                      >
                        <FaKey />
                      </button>
                      <button
                        className="action-btn toggle"
                        onClick={() => handleToggleStatus(user)}
                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                      >
                        {user.isActive ? <FaBan /> : <FaCheck />}
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteConfirm(true);
                        }}
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

        {/* User Modal (View/Edit/Create) */}
        {showUserModal && (
          <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
            <div className={`modal-content user-modal ${modalMode}`} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {modalMode === 'view' && <><FaEye /> User Details</>}
                  {modalMode === 'edit' && <><FaEdit /> Edit User</>}
                  {modalMode === 'create' && <><FaUserPlus /> Create New User</>}
                </h3>
                <button className="modal-close" onClick={() => setShowUserModal(false)}>×</button>
              </div>

              <div className="modal-body">
                {modalMode === 'view' && selectedUser && (
                  <div className="user-details-view">
                    <div className="detail-section">
                      <h4>Account Information</h4>
                      <div className="detail-row">
                        <span>Full Name:</span>
                        <strong>{selectedUser.fullName || '—'}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Email:</span>
                        <strong>{selectedUser.email}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Role:</span>
                        <strong>{getRoleBadge(selectedUser.role)}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Status:</span>
                        <strong>{getStatusBadge(selectedUser.isActive)}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Created:</span>
                        <strong>{formatDate(selectedUser.createdAt)}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Last Login:</span>
                        <strong>{formatDate(selectedUser.lastLogin)}</strong>
                      </div>
                    </div>

                    {selectedUser.clientInfo && (
                      <div className="detail-section">
                        <h4>Client Information</h4>
                        <div className="detail-row">
                          <span>First Name:</span>
                          <strong>{selectedUser.clientInfo.firstName || '—'}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Last Name:</span>
                          <strong>{selectedUser.clientInfo.lastName || '—'}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Middle Name:</span>
                          <strong>{selectedUser.clientInfo.middleName || '—'}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Contact Number:</span>
                          <strong>{selectedUser.clientInfo.contactNumber || '—'}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Birthday:</span>
                          <strong>{selectedUser.clientInfo.birthday ? new Date(selectedUser.clientInfo.birthday).toLocaleDateString() : '—'}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Company Name:</span>
                          <strong>{selectedUser.clientInfo.companyName || '—'}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Client Type:</span>
                          <strong>{selectedUser.clientInfo.client_type || '—'}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Account Setup:</span>
                          <strong>{selectedUser.clientInfo.account_setup ? 'Completed' : 'Pending'}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(modalMode === 'edit' || modalMode === 'create') && (
                  <form className="user-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="Enter full name"
                        />
                        <small>OR fill first/last name below</small>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="First name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="user@example.com"
                          disabled={modalMode === 'edit'}
                          className={formErrors.email ? 'error' : ''}
                        />
                        {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                        {modalMode === 'edit' && <small>Email cannot be changed</small>}
                      </div>
                      <div className="form-group">
                        <label>Contact Number</label>
                        <input
                          type="tel"
                          value={formData.contactNumber}
                          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                          placeholder="0917xxxxxxx"
                        />
                      </div>
                    </div>

                    {/* Role Field - Read-only in edit mode */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>Role</label>
                        {modalMode === 'create' ? (
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          >
                            <option value="user">Customer</option>
                            <option value="engineer">Engineer</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <div className="role-display">
                            <span className={`role-badge-display ${formData.role}`}>
                              {formData.role === 'admin' ? 'Admin' : formData.role === 'engineer' ? 'Engineer' : 'Customer'}
                            </span>
                            <small className="role-note-display">Role cannot be changed</small>
                          </div>
                        )}
                      </div>
                      <div className="form-group"></div>
                    </div>

                    {modalMode === 'create' && (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Password *</label>
                            <input
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="Enter password"
                              className={formErrors.password ? 'error' : ''}
                            />
                            {formErrors.password && <span className="error-text">{formErrors.password}</span>}
                          </div>
                          <div className="form-group">
                            <label>Confirm Password *</label>
                            <input
                              type="password"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              placeholder="Confirm password"
                              className={formErrors.confirmPassword ? 'error' : ''}
                            />
                            {formErrors.confirmPassword && <span className="error-text">{formErrors.confirmPassword}</span>}
                          </div>
                        </div>
                      </>
                    )}

                    {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                  </form>
                )}
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
                {(modalMode === 'edit' || modalMode === 'create') && (
                  <button className="save-btn" onClick={handleSaveUser} disabled={isSubmitting}>
                    {isSubmitting ? <><FaSpinner className="spinner" /> Saving...</> : 'Save User'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Password Reset Modal */}
        {showPasswordModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal-content password-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3><FaKey /> Reset Password</h3>
                <button className="modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
              </div>

              <div className="modal-body">
                <div className="user-info-summary">
                  <p><strong>User:</strong> {selectedUser.fullName || selectedUser.email}</p>
                  <p><strong>Role:</strong> {getRoleBadge(selectedUser.role)}</p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>New Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter new password"
                      className={passwordErrors.password ? 'error' : ''}
                    />
                    {passwordErrors.password && <span className="error-text">{passwordErrors.password}</span>}
                    <small>Password must be at least 6 characters</small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className={passwordErrors.confirmPassword ? 'error' : ''}
                    />
                    {passwordErrors.confirmPassword && <span className="error-text">{passwordErrors.confirmPassword}</span>}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleResetPassword} disabled={isSubmitting}>
                  {isSubmitting ? <><FaSpinner className="spinner" /> Resetting...</> : 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
              <div className="confirm-icon">
                <FaExclamationTriangle />
              </div>
              <h3>Delete User</h3>
              <p>Are you sure you want to delete <strong>{selectedUser.fullName || selectedUser.email}</strong>?</p>
              <p className="warning-text">This action cannot be undone. All associated client data will also be deleted.</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="delete-btn" onClick={handleDeleteUser} disabled={isSubmitting}>
                  {isSubmitting ? <><FaSpinner className="spinner" /> Deleting...</> : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserManagement;