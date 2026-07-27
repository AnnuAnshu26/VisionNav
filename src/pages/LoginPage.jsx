import React, { useState, useContext } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { UserContext, speakText } from '../context/UserContext';
import '../App.css';
import './LoginPage.css';

const LoginPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register, authError } = useContext(UserContext);

  const commands = [
    { command: 'set my name to *', callback: (named) => setName(named) },
    { command: 'set my contact to *', callback: (num) => setContactNumber(num.replace(/\s/g, '')) },
    { command: ['submit', 'login'], callback: () => document.getElementById('login-submit-button').click() },
  ];

  const { listening, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });

  const handleMicActivation = () => {
    if (!browserSupportsSpeechRecognition) {
      return alert("Browser doesn't support speech recognition.");
    }
    speakText('Login voice commands activated.');
    SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(contactNumber)) {
      return setError('Please enter a valid 10-digit contact number.');
    }
    if (password.length < 4) {
      return setError('Password must be at least 4 characters.');
    }
    if (mode === 'register' && !name.trim()) {
      return setError('Please enter your name.');
    }

    setSubmitting(true);
    let ok = false;
    if (mode === 'register') {
      ok = await register({
        name: name.trim(),
        contactNumber,
        emergencyContact: emergencyContact.trim(),
        password,
      });
    } else {
      ok = await login({ contactNumber, password });
    }
    setSubmitting(false);
    if (ok) speakText(mode === 'register' ? 'Account created. Welcome to NavAssist.' : 'Welcome back.');
  };

  return (
    <div className="login-container">
      <h1>Welcome to NavAssist</h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: '4px' }}>
        Your voice-guided companion for getting around safely.
      </p>

      <div className="login-tabs" role="tablist" aria-label="Choose login or create account">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          className={`login-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => { setMode('login'); setError(''); }}
        >
          Log In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          className={`login-tab ${mode === 'register' ? 'active' : ''}`}
          onClick={() => { setMode('register'); setError(''); }}
        >
          Create Account
        </button>
      </div>

      <div className="voice-form-toggle">
        <button onClick={handleMicActivation} disabled={listening} className="mic-button small-toggle">
          {listening ? '🎤 Listening…' : '🎤 Fill form by voice'}
        </button>
        <span className="status-chip">
          <span className="dot" aria-hidden="true" style={{ background: listening ? 'var(--accent)' : 'var(--text-faint)', boxShadow: 'none' }}></span>
          {listening ? 'Listening for a command' : 'Voice input inactive'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        {mode === 'register' && (
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        )}
        <div className="form-group">
          <label>Your 10-Digit Contact Number</label>
          <input
            type="tel"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            maxLength="10"
            required
          />
        </div>
        {mode === 'register' && (
          <div className="form-group">
            <label>Emergency Contact (Optional)</label>
            <input
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              maxLength="10"
              placeholder="Defaults to 8375004426"
            />
          </div>
        )}
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {(error || authError) && <p className="error-message">{error || authError}</p>}
        <button type="submit" id="login-submit-button" className="submit-button" disabled={submitting}>
          {submitting ? 'Please wait…' : mode === 'register' ? 'Create Account' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
