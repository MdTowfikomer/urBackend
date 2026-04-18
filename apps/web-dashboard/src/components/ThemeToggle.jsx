import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

// Read initial theme synchronously – avoids React-level flash
const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('urbackend-theme');
    if (saved === 'light') return false;   // false = light mode
    if (saved === 'dark') return true;     // true = dark mode
  } catch (err) {
    console.warn('localStorage not accessible, using system preference', err);
  }
  try {
    return !window.matchMedia('(prefers-color-scheme: light)').matches;
  } catch (err) {
    console.warn('window.matchMedia not available, defaulting to dark mode', err);
    return true; // default to dark mode
  }
};

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  }, [isDark]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e) => {
      try {
        if (!localStorage.getItem('urbackend-theme')) {
          setIsDark(!e.matches);
        }
      } catch (err) {
        console.warn('Could not read localStorage for theme sync', err);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    try {
      localStorage.setItem('urbackend-theme', newIsDark ? 'dark' : 'light');
    } catch (err) {
      console.warn('Failed to save theme preference', err);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="nav-item"
      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '8px' }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
};

export default ThemeToggle;