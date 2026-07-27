import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken, clearToken } from '../api/client';

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
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // On load, if we have a token, verify it against the backend.
  useEffect(() => {
    const bootstrap = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user: freshUser } = await api.me();
        setUser(freshUser);
      } catch (e) {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const register = useCallback(async ({ name, contactNumber, emergencyContact, password }) => {
    setAuthError('');
    try {
      const { token, user: newUser } = await api.register({
        name,
        contactNumber,
        emergencyContact,
        password,
      });
      setToken(token);
      setUser(newUser);
      return true;
    } catch (e) {
      setAuthError(e.message);
      return false;
    }
  }, []);

  const login = useCallback(async ({ contactNumber, password }) => {
    setAuthError('');
    try {
      const { token, user: loggedInUser } = await api.login({ contactNumber, password });
      setToken(token);
      setUser(loggedInUser);
      return true;
    } catch (e) {
      setAuthError(e.message);
      return false;
    }
  }, []);

  const updateUser = useCallback(async (updates) => {
    setAuthError('');
    try {
      const { user: updatedUser } = await api.updateProfile(updates);
      setUser(updatedUser);
      return true;
    } catch (e) {
      setAuthError(e.message);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = { user, loading, authError, setAuthError, register, login, logout, updateUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
