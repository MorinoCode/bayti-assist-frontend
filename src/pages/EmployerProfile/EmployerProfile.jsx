import React from 'react';
import { useTranslation } from 'react-i18next';

const EmployerProfile = () => {
  const { t } = useTranslation();
  return (
    <div className="profile-page dashboard-container">
      <main className="dashboard-main full-width">
        <header className="main-header">
          <div className="header-info">
            <h1>{t('employer')} Profile</h1>
            <p>Manage your account settings and preferences.</p>
          </div>
        </header>
        <section className="glass-card" style={{ padding: '2rem' }}>
          <h3>Profile Details</h3>
          <p>Coming soon...</p>
        </section>
      </main>
    </div>
  );
};

export default EmployerProfile;
