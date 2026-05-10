import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Mail, Lock, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import './CompanyAuth.css';

const CompanySignup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'company' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, method: 'email' };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (response.ok) {
        login(data);
        toast.success('Registration successful');
        navigate('/company-dashboard');
      } else {
        toast.error(data.message || 'Registration failed');
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
          <h1>Register Company</h1>
          <p>Create an account to manage and rent out workers</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Company Name</label>
            <div className="input-with-icon">
              <Building2 size={18} />
              <input 
                type="text" 
                name="name" 
                placeholder="Agency Name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

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
            <label>Phone Number</label>
            <div className="input-with-icon">
              <Phone size={18} />
              <input 
                type="tel" 
                name="phone" 
                placeholder="+1234567890" 
                value={formData.phone} 
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/company-login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default CompanySignup;
