import React, { useState, useContext } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { UserContext, speakText } from '../context/UserContext';
import './LoginPage.css';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(UserContext);

  const commands = [
    {
      command: 'set my name to *',
      callback: (named) => setName(named),
    },
    {
      command: 'set my contact to *',
      callback: (num) => setContactNumber(num.replace(/\s/g, '')),
    },
    {
      command: ['submit', 'login'],
      callback: () => document.getElementById('login-submit-button').click(),
    },
  ];

  const { listening, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });

  const handleMicActivation = () => {
    if (!browserSupportsSpeechRecognition) {
      return alert("Browser doesn't support speech recognition.");
    }
    speakText("Login voice commands activated.");
    SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !/^\d{10}$/.test(contactNumber)) {
      return setError('Please ensure name and a 10-digit contact number are set.');
    }
    let finalEmergencyContact = emergencyContact.trim() || '8375004426';
    setError('');
    login({ name: name.trim(), contactNumber, emergencyContact: finalEmergencyContact });
  };

  return (
    <div className="login-container">
      <h1>Welcome to NavAssist</h1>
      <div style={{margin: '1rem 0'}}>
        <button onClick={handleMicActivation} disabled={listening} className="mic-button">
          Activate Voice Form
        </button>
        <p>Status: {listening ? 'Listening...' : 'Inactive'}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Your 10-Digit Contact Number</label>
          <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} maxLength="10" required />
        </div>
        <div className="form-group">
          <label>Emergency Contact (Optional)</label>
          <input type="tel" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} maxLength="10" placeholder="Defaults to 8375004426" />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" id="login-submit-button" className="submit-button">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;