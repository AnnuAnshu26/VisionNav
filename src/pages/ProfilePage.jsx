import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';
import '../App.css';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return (
      <div className="profile-container">
        <PageHeader title="Your Profile" />
        <div className="card profile-card">Loading…</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <PageHeader title="Your Profile" subtitle="Your saved account details" />

      <div className="card profile-card">
        <div className="profile-row">
          <span className="label">Name</span>
          <span className="value">{user.name}</span>
        </div>
        <div className="profile-row">
          <span className="label">Contact Number</span>
          <span className="value">{user.contactNumber}</span>
        </div>
        <div className="profile-row">
          <span className="label">Emergency Contact</span>
          <span className="value">{user.emergencyContact}</span>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
