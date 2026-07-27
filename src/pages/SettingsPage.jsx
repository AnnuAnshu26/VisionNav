import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';
import '../App.css';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user, logout, updateUser } = useContext(UserContext);

  const [name, setName] = useState(user?.name || '');
  const [contact, setContact] = useState(user?.contactNumber || '');
  const [emergency, setEmergency] = useState(user?.emergencyContact || '');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setContact(user?.contactNumber || '');
    setEmergency(user?.emergencyContact || '');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const ok = await updateUser({
      name,
      contactNumber: contact,
      emergencyContact: emergency,
    });

    setSaving(false);
    setMessage(
      ok
        ? { type: 'success', text: 'Details updated.' }
        : { type: 'error', text: 'Could not update details. Please try again.' }
    );
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  return (
    <div className="settings-container">
      <PageHeader title="Settings" subtitle="Update your details or log out" />

      <form onSubmit={handleSubmit} className="settings-form card">
        <div className="form-group">
          <label htmlFor="settings-name">Name</label>
          <input id="settings-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="settings-contact">Contact Number</label>
          <input id="settings-contact" type="tel" value={contact} onChange={(e) => setContact(e.target.value)} maxLength="10" />
        </div>
        <div className="form-group">
          <label htmlFor="settings-emergency">Emergency Contact</label>
          <input id="settings-emergency" type="tel" value={emergency} onChange={(e) => setEmergency(e.target.value)} maxLength="10" />
        </div>

        {message.text && (
          <p className={message.type === 'success' ? 'success-message' : 'error-message'}>
            {message.text}
          </p>
        )}

        <button type="submit" className="submit-button" disabled={saving}>
          {saving ? 'Saving…' : 'Update Details'}
        </button>
      </form>

      <button onClick={logout} className="logout-button">Log Out</button>

      <BottomNav />
    </div>
  );
};

export default SettingsPage;
