import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const GlobalVoiceCommands = () => {
  const { addCommands, removeCommands, speakText, resetTranscript } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleNavigation = (feedback, path) => {
      speakText(feedback);
      navigate(path);
      resetTranscript();
    };
    
    const commands = [
      // --- NEW: Advanced navigation command ---
      {
        command: 'navigate to *',
        callback: (place) => {
          speakText(`Navigating to ${place}.`);
          // Dispatch a custom event that the MapView component can listen for
          window.dispatchEvent(new CustomEvent('nav:navigateTo', { detail: { place } }));
          navigate('/navigation');
          resetTranscript();
        },
      },
      {
        command: ['go to home', 'home'],
        callback: () => handleNavigation('Navigating to home.', '/'),
      },
      {
        command: ['go to profile', 'profile'],
        callback: () => handleNavigation('Navigating to profile.', '/profile'),
      },
      {
        command: ['go to navigation', 'navigation'],
        callback: () => handleNavigation('Navigating to navigation page.', '/navigation'),
      },
      {
        command: ['go to sos', 'sos'],
        callback: () => handleNavigation('Navigating to S O S.', '/sos'),
      },
      {
        command: ['go to settings', 'settings'],
        callback: () => handleNavigation('Navigating to settings.', '/settings'),
      },
      {
        command: 'go back',
        callback: () => {
          speakText('Going back.');
          window.history.back();
          resetTranscript();
        },
      },
    ];

    addCommands(commands);
    return () => removeCommands(commands);
  }, [addCommands, removeCommands, navigate, speakText, resetTranscript]);

  return null;
};

export default GlobalVoiceCommands;