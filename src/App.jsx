import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Home from './pages/Home/Home';
import EmployerDashboard from './pages/EmployerDashboard/EmployerDashboard';
import WorkerDashboard from './pages/WorkerDashboard/WorkerDashboard';
import MyProfileEmployee from './pages/MyProfile/MyProfileEmployee';
import MyProfileWorker from './pages/MyProfile/MyProfileWorker';
import MyWorkers from './pages/MyWorkers/MyWorkers';
import ManageWorker from './pages/ManageWorker/ManageWorker';
import ManageEmployer from './pages/ManageEmployer/ManageEmployer';
import Tracking from './pages/Tracking/Tracking';
import OnboardingEmployer from './pages/Onboarding/OnboardingEmployer';
import OnboardingWorker from './pages/Onboarding/OnboardingWorker';
import Services from './pages/Services/Services';
import HowItWorks from './pages/HowItWorks/HowItWorks';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';
import Contact from './pages/Contact/Contact';
import Companies from './pages/Companies/Companies';
import CompanyProfile from './pages/CompanyProfile/CompanyProfile';
import CompanyLogin from './pages/CompanyDashboard/CompanyLogin';
import CompanySignup from './pages/CompanyDashboard/CompanySignup';
import CompanyDashboard from './pages/CompanyDashboard/CompanyDashboard';
import Navbar from './components/Navbar/Navbar';
import { useTranslation } from 'react-i18next';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import WorkerGlobalServices from './components/WorkerGlobalServices';

function App() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  let dashboardPath = '/';
  if (user?.role === 'employer') dashboardPath = '/employer-dashboard';
  else if (user?.role === 'worker') dashboardPath = '/worker-dashboard';
  else if (user?.role === 'company') dashboardPath = '/company-dashboard';

  useEffect(() => {
    document.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n, i18n.language]);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <WorkerGlobalServices />
        <Routes>
          <Route path="/" element={user ? <Navigate to={dashboardPath} /> : <Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />
          <Route path="/employer-profile" element={<MyProfileEmployee />} />
          <Route path="/worker-profile" element={<MyProfileWorker />} />
          <Route path="/my-workers" element={<MyWorkers />} />
          <Route path="/manage-worker/:workerId" element={<ManageWorker />} />
          <Route path="/manage-employer/:employmentId" element={<ManageEmployer />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/onboarding-employee" element={<OnboardingEmployer />} />
          <Route path="/onboarding-worker" element={<OnboardingWorker />} />
          <Route path="/services" element={<Services />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:companyId" element={<CompanyProfile />} />
          <Route path="/company-login" element={<CompanyLogin />} />
          <Route path="/company-signup" element={<CompanySignup />} />
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1b26',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
            },
          }} 
        />
      </div>
    </Router>
  );
}

export default App;
