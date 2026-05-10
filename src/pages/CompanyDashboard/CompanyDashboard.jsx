import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    role: 'Maid',
    gender: 'female',
    nationality: '',
    experience: 0,
    age: 25,
    salary: 0,
    status: 'available'
  });

  const fetchWorkers = useCallback(async () => {
    try {
      if (!user?._id) return;
      // Note: We need a backend route to get my own workers as a company. For now, reusing the public route since we know our ID.
      const response = await fetch(`${import.meta.env.VITE_API_URL}/companies/${user._id}/workers`);
      if (response.ok) {
        const data = await response.json();
        setWorkers(data);
      }
    } catch {
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'company') {
      navigate('/company-login');
      return;
    }
    const init = async () => {
      await fetchWorkers();
    };
    init();
  }, [user, navigate, fetchWorkers]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const url = editingWorker 
        ? `${import.meta.env.VITE_API_URL}/companies/workers/${editingWorker._id}`
        : `${import.meta.env.VITE_API_URL}/companies/workers`;
      const method = editingWorker ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingWorker ? 'Worker updated' : 'Worker added');
        setShowAddModal(false);
        setEditingWorker(null);
        setFormData({ name: '', role: 'Maid', gender: 'female', nationality: '', experience: 0, age: 25, salary: 0, status: 'available' });
        fetchWorkers();
      } else {
        toast.error('Operation failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this worker?')) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/companies/workers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });

      if (response.ok) {
        toast.success('Worker removed');
        fetchWorkers();
      }
    } catch {
      toast.error('Failed to delete worker');
    }
  };

  const openEditModal = (worker) => {
    setEditingWorker(worker);
    setFormData(worker);
    setShowAddModal(true);
  };

  return (
    <div className="company-dashboard-page animate-fade">
      <div className="dashboard-header glass-card">
        <div>
          <h1>{user?.name} Dashboard</h1>
          <p>Manage your worker roster</p>
        </div>
        <button className="add-worker-btn" onClick={() => { setEditingWorker(null); setShowAddModal(true); }}>
          <Plus size={18} /> Add New Worker
        </button>
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : workers.length > 0 ? (
          <div className="workers-table-container glass-card">
            <table className="workers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Nationality</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(worker => (
                  <tr key={worker._id}>
                    <td>
                      <div className="w-table-info">
                        <div className="w-table-avatar">{worker.name.charAt(0)}</div>
                        <span>{worker.name}</span>
                      </div>
                    </td>
                    <td>{worker.role}</td>
                    <td>{worker.nationality}</td>
                    <td><span className={`status-badge ${worker.status}`}>{worker.status}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn edit" onClick={() => openEditModal(worker)}><Edit2 size={16} /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(worker._id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-roster glass-card">
            <Users size={48} className="empty-icon" />
            <h2>No Workers Found</h2>
            <p>You haven't added any workers to your roster yet.</p>
            <button className="add-worker-btn mt-4" onClick={() => setShowAddModal(true)}>Add Your First Worker</button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-zoom">
            <h2>{editingWorker ? 'Edit Worker' : 'Add New Worker'}</h2>
            <form onSubmit={handleSubmit} className="worker-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="Maid">Maid</option>
                    <option value="Nanny">Nanny</option>
                    <option value="Driver">Driver</option>
                    <option value="Chef">Chef</option>
                    <option value="Caregiver">Caregiver</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nationality</label>
                  <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} required min="18" />
                </div>
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input type="number" name="experience" value={formData.experience} onChange={handleChange} required min="0" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expected Salary (KWD)</label>
                  <input type="number" name="salary" value={formData.salary} onChange={handleChange} required min="0" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="available">Available</option>
                    <option value="rented">Rented / Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">{editingWorker ? 'Save Changes' : 'Add Worker'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
