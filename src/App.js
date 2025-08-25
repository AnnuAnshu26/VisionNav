import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './context/UserContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NavigationPage from './pages/NavigationPage';
import DetectionPage from './pages/DetectionPage';
import SosPage from './pages/SosPage';
import SettingsPage from './pages/SettingsPage';
import ReportPage from './pages/ReportPage';
import ProfilePage from './pages/ProfilePage';
import VoiceHandler from './components/VoiceHandler'; // <-- updated
import './App.css';

function MainAppLayout() {
  return (
    <>
      <VoiceHandler /> {/* Only this component handles all voice commands now */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/navigation" element={<NavigationPage />} />
        <Route path="/detection" element={<DetectionPage />} />
        <Route path="/sos" element={<SosPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function AppContent() {
  const { user } = useContext(UserContext);
  return (
    <Routes>
      <Route path="/*" element={user ? <MainAppLayout /> : <Navigate to="/login" />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
