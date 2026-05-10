import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Companies.css';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/companies`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Failed to fetch companies', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchCompanies();
    };
    init();
  }, [fetchCompanies]);

  return (
    <div className="companies-page animate-fade">
      <div className="companies-header glass-card">
        <h1>Our Partner Companies</h1>
        <p>Find the best domestic workers from our trusted partner agencies.</p>
        <span className="beta-badge">Beta Feature - Coming Soon</span>
      </div>

      <div className="companies-container">
        {loading ? (
          <div className="loading-spinner">Loading companies...</div>
        ) : companies.length > 0 ? (
          <div className="companies-grid">
            {companies.map(company => (
              <Link to={`/companies/${company._id}`} key={company._id} className="company-card glass-card">
                <div className="company-avatar">
                  {company.name ? company.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <h3>{company.name}</h3>
                <p className="company-email">{company.email}</p>
                <button className="view-btn">View Workers</button>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-companies glass-card">
            <h2>No Companies Found</h2>
            <p>We are currently onboarding partner companies. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
