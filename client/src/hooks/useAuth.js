import { useState, useEffect, useCallback } from 'react';

const API = `${process.env.REACT_APP_API_URL}/api/auth`;

// Store tokens in memory (access) and localStorage (refresh)
// Access token in memory = not vulnerable to XSS
// Refresh token in localStorage = persists across page reloads
let inMemoryAccessToken = null;

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount: try to restore session using stored refresh token
  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API}/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (res.ok) {
          const data = await res.json();
          inMemoryAccessToken = data.accessToken;
          localStorage.setItem('refreshToken', data.refreshToken);

          // Fetch user profile with the new access token
          const profileRes = await fetch('/api/user/profile', {
            headers: { Authorization: `Bearer ${inMemoryAccessToken}` },
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setUser(profileData.user);
          }
        } else {
          localStorage.removeItem('refreshToken');
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const signup = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      inMemoryAccessToken = data.accessToken;
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      inMemoryAccessToken = data.accessToken;
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await fetch(`${API}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      inMemoryAccessToken = null;
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  }, []);

  // Helper for authenticated fetch calls — auto-attaches access token
  const authFetch = useCallback(async (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${inMemoryAccessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }, []);

  return { user, loading, error, signup, login, logout, authFetch };
};
