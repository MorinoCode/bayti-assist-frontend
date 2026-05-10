import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import './CompanyProfile.css';

const CompanyProfile = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const fetchCompanyData = useCallback(async () => {
    try {
      // Fetch workers
      const workersRes = await fetch(`${import.meta.env.VITE_API_URL}/companies/${companyId}/workers`);
      if (workersRes.ok) {
        const workersData = await workersRes.json();
        setWorkers(workersData);
      }
      
      // In a real app we'd fetch company details via an API. For now, infer or show a generic title if we don't have it in state
      setCompany({ id: companyId, name: 'Partner Company' });
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    const init = async () => {
      await fetchCompanyData();
    };
    init();
  }, [fetchCompanyData]);

  const filteredWorkers = workers.filter(w => {
    if (roleFilter !== 'all' && w.role !== roleFilter) return false;
    if (genderFilter !== 'all' && w.gender !== genderFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const uniqueRoles = ['all', ...new Set(workers.map(w => w.role))];

  return (
    <div className="company-profile-page animate-fade">
      <div className="profile-header glass-card">
        <button className="back-btn" onClick={() => navigate('/companies')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Companies
        </button>
        <div className="company-hero">
          <div className="c-avatar">{company?.name ? company.name.charAt(0) : 'C'}</div>
          <div>
            <h1>{company?.name}</h1>
            <p>Available Workers: {workers.length}</p>
          </div>
        </div>
      </div>

      <div className="filters-section glass-card">
        <div className="filter-group">
          <label><Filter size={16}/> Role</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role === 'all' ? 'All Roles' : role}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Gender</label>
          <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option value="all">All Genders</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="newest">Newest Added</option>
            <option value="oldest">Oldest Added</option>
          </select>
        </div>
      </div>

      <div className="workers-list">
        {loading ? (
          <div className="loading-spinner">Loading workers...</div>
        ) : filteredWorkers.length > 0 ? (
          <div className="workers-grid">
            {filteredWorkers.map(worker => (
              <div key={worker._id} className="worker-public-card glass-card">
                <div className="w-avatar">
                  {worker.avatar ? <img src={worker.avatar} alt={worker.name} /> : worker.name.charAt(0)}
                </div>
                <h3>{worker.name}</h3>
                <span className="w-role">{worker.role}</span>
                <div className="w-details">
                  <span>{worker.nationality}</span>
                  <span>•</span>
                  <span>{worker.gender}</span>
                  <span>•</span>
                  <span>{worker.age} yrs</span>
                </div>
                <div className="w-footer">
                  <span className={`w-status ${worker.status}`}>{worker.status}</span>
                  <button className="contact-agency-btn">Contact Agency</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-workers glass-card">
            <p>No workers found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfile;
