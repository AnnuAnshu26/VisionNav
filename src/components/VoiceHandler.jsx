import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const VoiceHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
  } = useSpeechRecognition();

  // Ref to ensure startListening is called only once
  const listeningStarted = useRef(false);

  // --- Start Listening Logic ---
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert("Browser doesn't support speech recognition.");
      return;
    }

    // A small delay can help ensure microphone permissions are sorted
    const startMic = () => {
      if (!listeningStarted.current) {
        SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
        listeningStarted.current = true;
      }
    };

    const timer = setTimeout(startMic, 500); // 0.5 second delay

    // Cleanup function to stop listening when component unmounts
    return () => {
      clearTimeout(timer);
      SpeechRecognition.stopListening();
    };
  }, [browserSupportsSpeechRecognition]);

  // --- Command Processing Logic ---
  useEffect(() => {
    // Don't do anything if there's no new transcript
    if (!transcript) return;

    const command = transcript.toLowerCase();
    let actionTaken = false;

    // Navigation Commands
    if (command.includes('home') || command.includes('main page')) {
      navigate('/');
      actionTaken = true;
    } else if (command.includes('back')) {
      navigate(-1);
      actionTaken = true;
    } else if (command.includes('profile')) {
      navigate('/profile');
      actionTaken = true;
    } else if (command.includes('settings')) {
      navigate('/settings');
      actionTaken = true;
    } else if (command.includes('sos') || command.includes('emergency')) {
      sendEmergencySMS();
      actionTaken = true;
    }

    // After processing a command, reset the transcript
    if (actionTaken) {
      resetTranscript();
    }
  }, [transcript, navigate, resetTranscript]);

  // --- SOS Function ---
  const sendEmergencySMS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapLink = `http://googleusercontent.com/maps/search/?api=1&query=${latitude},${longitude}`;
        const emergencyMessage = encodeURIComponent(`Emergency! Help needed. My location: ${mapLink}`);
        const emergencyNumber = '1234567890'; // IMPORTANT: Use a real number
        const smsLink = `sms:${emergencyNumber}?body=${emergencyMessage}`;
        window.open(smsLink);
      },
      () => alert('Unable to retrieve your location for the SOS message.')
    );
  };

  // --- Speak Back Function ---
  const speakLastTranscript = () => {
    // We use the transcript directly from the hook
    if (transcript) {
      const utterance = new SpeechSynthesisUtterance(transcript);
      speechSynthesis.speak(utterance);
    } else {
      const utterance = new SpeechSynthesisUtterance('I did not hear anything clearly.');
      speechSynthesis.speak(utterance);
    }
    resetTranscript(); // Clear after speaking
  };

  // --- Conditional UI Rendering ---
  // Hide UI on the home page
  if (location.pathname === '/home' || location.pathname === '/') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#fff',
      padding: '10px 20px',
      borderRadius: '30px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      display: 'flex',
      alignItems: 'center',
      zIndex: 1000,
      transition: 'background-color 0.3s',
    }}>
      <span style={{ marginRight: '15px', color: '#333', fontStyle: 'italic' }}>
        {listening ? (transcript || 'Listening...') : 'Mic Off'}
      </span>
      <button 
        onClick={speakLastTranscript} 
        style={{ 
          border: 'none', 
          background: listening ? '#4CAF50' : '#f44336', 
          color: 'white',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        🎤
      </button>
    </div>
  );
};

export default VoiceHandler;