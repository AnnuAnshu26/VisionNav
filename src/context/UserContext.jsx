import React, { createContext, useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// This function can be imported and used anywhere
export const speakText = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }
};

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [commands, setCommands] = useState([]);
  const [micPermission, setMicPermission] = useState('prompt');

  const {
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({ commands });

  // Check initial permission status when the app loads
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' }).then((permissionStatus) => {
        setMicPermission(permissionStatus.state);
        permissionStatus.onchange = () => setMicPermission(permissionStatus.state);
      });
    }
  }, []);
  
  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('app_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const startListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      alert("This browser does not support speech recognition.");
      return;
    }
    if (micPermission === 'denied') {
      const message = "Microphone access is denied. Please enable it in your browser settings by clicking the lock icon in the address bar.";
      speakText(message);
      alert(message);
      return;
    }
    speakText("Microphone activated.");
    SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
  }, [browserSupportsSpeechRecognition, micPermission]);

  const stopListening = useCallback(() => {
    speakText("Microphone off.");
    SpeechRecognition.stopListening();
  }, []);

  const login = useCallback((userData) => {
    localStorage.setItem('app_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('app_user');
    setUser(null);
    stopListening();
  }, [stopListening]);

  const addCommands = useCallback((newCommands) => {
    setCommands(prev => [...prev, ...newCommands]);
  }, []);

  const removeCommands = useCallback((commandsToRemove) => {
    const commandStrings = commandsToRemove.map(c => c.command.toString());
    setCommands(prev => prev.filter(c => !commandStrings.includes(c.command.toString())));
  }, []);

  const value = {
    user,
    login,
    logout,
    listening,
    startListening,
    stopListening,
    addCommands,
    removeCommands,
    resetTranscript,
    speakText,
    micPermission,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};