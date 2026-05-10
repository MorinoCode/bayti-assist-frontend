import React from 'react';
import { Capacitor } from '@capacitor/core';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const platform = Capacitor.getPlatform();

  return (
    <div className="privacy-page animate-fade">
      <div className="privacy-container glass-card">
        <header className="privacy-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: May 2026</p>
        </header>

        <section className="privacy-section">
          <h2>1. Introduction</h2>
          <p>Bayti Assist ("we", "our", or "us") is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.</p>
        </section>

        <section className="privacy-section">
          <h2>2. Information We Collect</h2>
          <div className="info-box">
            <h3>Real-Time Location Data</h3>
            <p>Our app provides live tracking for domestic staff. We collect precise location data even when the app is in the background to ensure continuous safety monitoring.</p>
          </div>
          <div className="info-box">
            <h3>Audio & Video Monitoring</h3>
            <p>If granted explicit permission, we may access your device camera and microphone for live streaming to your employer for safety verification.</p>
          </div>
        </section>

        <section className="privacy-section">
          <h2>3. Explicit Consent & Control</h2>
          <p>Safety is our priority, but privacy is your right. No tracking or monitoring will occur without the worker's explicit in-app consent. Workers can revoke these permissions at any time via the app settings.</p>
        </section>

        {platform === 'ios' && (
          <section className="privacy-section apple-compliance">
            <div className="platform-badge apple">Apple App Store Compliance</div>
            <h2>Apple Data Privacy Disclosures</h2>
            <p>In accordance with Apple's App Store Review Guidelines (5.1.1):</p>
            <ul>
              <li><strong>Data Minimization:</strong> We only collect data essential for the safety monitoring feature.</li>
              <li><strong>Revocable Access:</strong> You can disable location tracking via iOS System Settings {'>'} Privacy {'>'} Location Services.</li>
              <li><strong>Safety Purpose:</strong> Background location is used solely for the purpose of protecting domestic staff and providing peace of mind to families.</li>
            </ul>
          </section>
        )}

        {platform === 'android' && (
          <section className="privacy-section google-compliance">
            <div className="platform-badge google">Google Play Store Compliance</div>
            <h2>Google Play Developer Policy</h2>
            <p>In compliance with Google Play's Personal and Sensitive User Data policy:</p>
            <ul>
              <li><strong>Prominent Disclosure:</strong> This app uses background location to enable real-time safety tracking even when the app is closed.</li>
              <li><strong>Encryption:</strong> All sensitive data (Location, Audio, Video) is encrypted during transmission using TLS 1.3.</li>
              <li><strong>No Data Sharing:</strong> Your personal data is never sold or shared with third-party advertising networks.</li>
            </ul>
          </section>
        )}

        <section className="privacy-section">
          <h2>4. Data Security</h2>
          <p>We use industry-standard encryption and security protocols to ensure that your data is accessible only by authorized parties (your designated employer).</p>
        </section>

        <footer className="privacy-footer">
          <p>By using Bayti Assist, you agree to the terms outlined in this policy.</p>
          <button className="cta-primary" onClick={() => window.history.back()}>I Understand</button>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
