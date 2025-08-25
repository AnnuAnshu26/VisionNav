import React, { useState, useContext, useEffect, useCallback } from 'react';
import { UserContext } from '../context/UserContext';
import './LoginPage.css';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [error, setError] = useState('');
  
  const { 
    login, 
    addCommands, 
    removeCommands, 
    speakText, 
    startListening, 
    listening,
    resetTranscript
  } = useContext(UserContext);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (!name.trim() || !/^\d{10}$/.test(contactNumber)) {
      const errorMsg = 'Please ensure name and a 10-digit contact number are set.';
      setError(errorMsg);
      speakText(errorMsg);
      return;
    }
    let finalEmergencyContact = emergencyContact.trim() || '8375004426';
    setError('');
    login({ name: name.trim(), contactNumber, emergencyContact: finalEmergencyContact });
  }, [name, contactNumber, emergencyContact, login, speakText]);

  useEffect(() => {
    const pageCommands = [
      {
        command: 'set my name to *',
        callback: (named) => {
          setName(named);
          speakText(`Name set to ${named}`);
          resetTranscript();
        },
      },
      {
        command: 'set my contact to *',
        callback: (num) => {
          const formattedNum = num.replace(/\s/g, '');
          setContactNumber(formattedNum);
          speakText(`Contact set to ${formattedNum}`);
          resetTranscript();
        },
      },
      {
        command: ['submit', 'login'],
        callback: () => {
          speakText('Submitting.');
          handleSubmit();
          resetTranscript();
        },
      },
    ];
    addCommands(pageCommands);
    return () => removeCommands(pageCommands);
  }, [addCommands, removeCommands, speakText, handleSubmit, resetTranscript]);

  return (
    <div className="login-container">
      <h1>Welcome to NavAssist</h1>
      <div className="mic-activation" style={{margin: '1rem 0'}}>
        <button onClick={startListening} disabled={listening} className="mic-button">
          Activate Voice Commands
        </button>
        <p>Status: {listening ? 'Listening...' : 'Inactive'}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="contactNumber">Your 10-Digit Contact Number</label>
          <input type="tel" id="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} maxLength="10" required />
        </div>
        <div className="form-group">
          <label htmlFor="emergencyContact">Emergency Contact (Optional)</label>
          <input type="tel" id="emergencyContact" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} maxLength="10" placeholder="Defaults to 8375004426" />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-button">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;