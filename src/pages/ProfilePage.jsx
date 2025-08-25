import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';import './ProfilePage.css'; // You'll need to create this CSS file

const ProfilePage = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <div className="profile-container">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      <div className="profile-card">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Contact Number:</strong> {user.contactNumber}</p>
        <p><strong>Emergency Contact:</strong> {user.emergencyContact}</p>
      </div>
    </div>
  );
};

export default ProfilePage;