import React, { useState } from 'react';

import { speakText } from '../utils/speech';

const SosPage = () => {
  const [status, setStatus] = useState('Idle. Click the button to prepare the SOS message.');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const emergencyContact = '8375004426'; // Your default emergency contact

  const prepareSOS = () => {
    if (isGettingLocation) return;

    setIsGettingLocation(true);
    setStatus('Getting your current location...');
    speakText('Getting your current location. Please wait.');

    // 1. This function asks the browser for your GPS coordinates
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setStatus('Location found. Opening your SMS app...');
        speakText('Location found. Opening your SMS application now. Please press send.');
        
        const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        const messageBody = `EMERGENCY SOS! I need help. My current location is: ${googleMapsLink}`;
        const encodedMessage = encodeURIComponent(messageBody);
        
        // 2. This creates the special link to open the SMS app
        const smsLink = `sms:${emergencyContact}?body=${encodedMessage}`;
        
        // 3. This line triggers the device to open the messaging app
        window.location.href = smsLink;
        
        setIsGettingLocation(false);
      },
      () => {
        // ... error handling ...
      }
    );
  };

  return (
    <div>
      <h1>Emergency SOS</h1>
      <p>This will open your default SMS app with a pre-filled emergency message. <strong>You must press 'Send' to send the alert.</strong></p>
      
      <button onClick={prepareSOS} disabled={isGettingLocation}>
        {isGettingLocation ? 'GETTING LOCATION...' : 'PREPARE SOS MESSAGE'}
      </button>

      {/* ... status display ... */}
    </div>
  );
};

export default SosPage;