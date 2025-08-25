import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext';import './SettingsPage.css'; // You'll need to create this CSS file

const SettingsPage = () => {
  const { user, logout, updateUser } = useContext(UserContext);
  
  // Initialize state with user data from context
  const [name, setName] = useState(user?.name || '');
  const [contact, setContact] = useState(user?.contactNumber || '');
  const [emergency, setEmergency] = useState(user?.emergencyContact || '');

  // Update state if the user object in context changes
  useEffect(() => {
    setName(user?.name || '');
    setContact(user?.contactNumber || '');
    setEmergency(user?.emergencyContact || '');
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({ 
      name: name, 
      contactNumber: contact, 
      emergencyContact: emergency 
    });
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Contact Number</label>
          <input type="tel" value={contact} onChange={(e) => setContact(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Emergency Contact</label>
          <input type="tel" value={emergency} onChange={(e) => setEmergency(e.target.value)} />
        </div>
        <button type="submit" className="submit-button">Update Details</button>
      </form>
      <button onClick={logout} className="logout-button">Log Out</button>
    </div>
  );
};

export default SettingsPage;