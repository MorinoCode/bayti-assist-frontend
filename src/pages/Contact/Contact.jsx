import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import './Contact.css';

const Contact = () => {
  const [activeTab, setActiveTab] = useState('user');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'user'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: activeTab })
      });

      if (response.ok) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '', type: activeTab });
      } else {
        toast.error('Failed to send message.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page animate-fade">
      <div className="contact-container glass-card">
        <div className="contact-info">
          <h1>Get in <span className="gradient-text">Touch</span></h1>
          <p>Have questions or need support? Select your category and send us a message.</p>
          
          <div className="contact-tabs">
            <button 
              className={`contact-tab ${activeTab === 'user' ? 'active' : ''}`}
              onClick={() => setActiveTab('user')}
            >
              Users
            </button>
            <button 
              className={`contact-tab ${activeTab === 'company' ? 'active' : ''}`}
              onClick={() => setActiveTab('company')}
            >
              Companies
            </button>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{activeTab === 'user' ? 'Full Name' : 'Company Name'}</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="John Doe" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="john@example.com" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input 
              type="text" 
              name="subject" 
              value={formData.subject} 
              onChange={handleChange} 
              placeholder="How can we help?" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              placeholder="Your message here..." 
              rows="5" 
              required
            ></textarea>
          </div>
          
          <button type="submit" className="cta-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
