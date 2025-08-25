import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './context/UserContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NavigationPage from './pages/NavigationPage';
import SosPage from './pages/SosPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import GlobalVoiceCommands from './components/GlobalVoiceCommands';
import './App.css';

function MainAppLayout() {
  return (
    <>
      <GlobalVoiceCommands />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/navigation" element={<NavigationPage />} />
        <Route path="/sos" element={<SosPage />} />
        <Route path="/settings" element={<SettingsPage />} />
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