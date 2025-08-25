import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const VoiceHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transcript, listening, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();

  const listeningStarted = useRef(false);
  const commandLock = useRef(false);
  const processTimer = useRef(null);

  // --- Start Listening ---
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert("Browser doesn't support speech recognition.");
      return;
    }
    const startMic = () => {
      if (!listeningStarted.current) {
        SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
        listeningStarted.current = true;
      }
    };
    const timer = setTimeout(startMic, 500);
    return () => {
      clearTimeout(timer);
      SpeechRecognition.stopListening();
    };
  }, [browserSupportsSpeechRecognition]);

  // --- Handle Commands ---
  useEffect(() => {
    if (!transcript || commandLock.current) return;

    if (processTimer.current) clearTimeout(processTimer.current);

    processTimer.current = setTimeout(async () => {
      commandLock.current = true;
      let cmd = transcript.toLowerCase().trim();

      // Remove filler words
      cmd = cmd.replace(/please|the|to/gi, "").replace(/\.$/, "").trim();

      // --- Always allow back/home regardless of page ---
      if (cmd.includes('go back') || cmd === 'back') {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Going back."));
        navigate(-1);
      } else if (cmd.includes('home') || cmd.includes('main page')) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Navigating to home."));
        navigate('/');
      } else if (cmd.includes('profile')) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Navigating to profile."));
        navigate('/profile');
      } else if (cmd.includes('settings')) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Navigating to settings."));
        navigate('/settings');
      } else if (cmd.includes('sos') || cmd.includes('help')) {
        sendEmergencySMS();
      } else if (cmd.includes('report')) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Opening report page."));
        navigate('/report');
      } else if (cmd.match(/^(navigate|go)\s+.+/)) {
        // --- Robust navigation command ---
        const placeMatch = cmd.match(/(?:navigate|go)\s+(.+)/);
        const place = placeMatch ? placeMatch[1].trim() : "";
        if (place) {
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Navigating to ${place}.`));
          window.dispatchEvent(new CustomEvent('nav:navigateTo', { detail: { place } }));
          if (location.pathname !== '/navigation') navigate('/navigation');
        } else {
          window.speechSynthesis.speak(new SpeechSynthesisUtterance("Please say the destination clearly."));
        }
      } 
      resetTranscript();
      commandLock.current = false;
    }, 500);
  }, [transcript, navigate, resetTranscript, location.pathname]);

  // --- SOS Function ---
  const sendEmergencySMS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapLink = `http://google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        const emergencyMessage = encodeURIComponent(`Emergency! Help needed. My location: ${mapLink}`);
        const emergencyNumber = '1234567890'; // Replace with real number
        const smsLink = `sms:${emergencyNumber}?body=${emergencyMessage}`;
        window.open(smsLink);
      },
      () => alert('Unable to retrieve location for SOS message.')
    );
  };

  if (location.pathname === '/home' || location.pathname === '/') return null;

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
        onClick={() => {
          if (transcript) {
            const utter = new SpeechSynthesisUtterance(transcript);
            window.speechSynthesis.speak(utter);
            resetTranscript();
          }
        }}
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
