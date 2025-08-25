import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { speakText } from '../context/UserContext';

const VoiceController = () => {
  const navigate = useNavigate();
  const { transcript, resetTranscript } = useSpeechRecognition();

  // This is our new, smarter command parser.
  const parseCommand = useCallback((phrase) => {
    const lowerCasePhrase = phrase.toLowerCase();

    // Handle the most specific commands first
    if (lowerCasePhrase.startsWith('navigate to')) {
      const place = lowerCasePhrase.substring('navigate to'.length).trim();
      if (place) {
        speakText(`Navigating to ${place}.`);
        window.dispatchEvent(new CustomEvent('nav:navigateTo', { detail: { place } }));
        navigate('/navigation');
        return true; // Command was handled
      }
    }

    // Handle simple navigation keywords
    if (lowerCasePhrase.includes('profile')) {
      speakText('Navigating to profile.');
      navigate('/profile');
      return true;
    }
    if (lowerCasePhrase.includes('settings')) {
      speakText('Navigating to settings.');
      navigate('/settings');
      return true;
    }
    if (lowerCasePhrase.includes('sos')) {
      speakText('Opening S O S.');
      navigate('/sos');
      return true;
    }
    if (lowerCasePhrase.includes('report')) {
        speakText('Opening report page.');
        navigate('/report');
        return true;
    }
    if (lowerCasePhrase.includes('home')) {
        speakText('Navigating to home.');
        navigate('/');
        return true;
    }
    if (lowerCasePhrase.includes('back')) {
      speakText('Going back.');
      window.history.back();
      return true;
    }

    return false; // No command was handled
  }, [navigate]);


  // This useEffect watches the transcript and calls our parser
  useEffect(() => {
    if (transcript) {
      const commandHandled = parseCommand(transcript);
      if (commandHandled) {
        resetTranscript();
      }
    }
  }, [transcript, parseCommand, resetTranscript]);


  // This hook starts the microphone as soon as the user is logged in
  useEffect(() => {
    speakText("NavAssist is ready. Say a command.");
    SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    
    return () => {
      SpeechRecognition.stopListening();
    };
  }, []);

  return null; // This is a "headless" component
};

export default VoiceController;