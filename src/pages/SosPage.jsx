import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { api } from '../api/client';
import { speakText } from '../utils/speech';
import PageHeader from '../components/PageHeader';
import '../App.css';
import './SosPage.css';

const SosPage = () => {
  const { user } = useContext(UserContext);
  const [status, setStatus] = useState("Tap the button below to prepare your SOS message.");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const emergencyContact = user?.emergencyContact || '8375004426';

  const prepareSOS = () => {
    if (isGettingLocation) return;

    setIsGettingLocation(true);
    setStatus('Getting your current location…');
    speakText('Getting your current location. Please wait.');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStatus('Location found. Opening your SMS app…');
        speakText('Location found. Opening your SMS application now. Please press send.');

        try {
          await api.createSos({ lat: latitude, lng: longitude, emergencyContact });
        } catch (e) {
          console.error('Failed to log SOS alert on server:', e.message);
        }

        const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        const messageBody = `EMERGENCY SOS! I need help. My current location is: ${googleMapsLink}`;
        const encodedMessage = encodeURIComponent(messageBody);

        const smsLink = `sms:${emergencyContact}?body=${encodedMessage}`;
        window.location.href = smsLink;

        setIsGettingLocation(false);
        setStatus("SOS message prepared — send it from your SMS app to complete the alert.");
      },
      () => {
        setStatus('Unable to retrieve your location. Please check location permissions.');
        speakText('Unable to retrieve your location.');
        setIsGettingLocation(false);
      }
    );
  };

  return (
    <div className="sos-container">
      <PageHeader title="Emergency SOS" subtitle="One tap to alert your emergency contact" />

      <div className="sos-body">
        <button className="sos-trigger" onClick={prepareSOS} disabled={isGettingLocation}>
          <span className="sos-trigger-icon" aria-hidden="true">🆘</span>
          {isGettingLocation ? 'GETTING LOCATION…' : 'SEND SOS'}
        </button>

        <p className="sos-status">{status}</p>

        <div className="card sos-info">
          <p>
            This opens your default SMS app with a pre-filled emergency message and your live
            location, sent to:
          </p>
          <p className="sos-contact">{emergencyContact}</p>
          <p className="sos-note">You still need to press <strong>Send</strong> — browsers can't send text messages on their own.</p>
        </div>
      </div>
    </div>
  );
};

export default SosPage;
