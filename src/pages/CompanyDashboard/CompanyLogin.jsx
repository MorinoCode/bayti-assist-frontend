import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import './CompanyAuth.css'; // Shared CSS for login and signup

const CompanyLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, method: 'email' };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (response.ok) {
        if (data.role !== 'company') {
          toast.error('This portal is only for registered companies.');
          return;
        }
        login(data);
        toast.success('Login successful');
        navigate('/company-dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-auth-page animate-fade">
      <div className="auth-container glass-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <Building2 size={32} />
          </div>
          <h1>Company Portal</h1>
          <p>Sign in to manage your workforce</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                name="email" 
                placeholder="agency@example.com" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have a company account? <Link to="/company-signup">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogin;
