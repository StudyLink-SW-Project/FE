// src/components/ThemeToggle.jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ className = "" }) {
  const {toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-200 ${className}`}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDark ? (
        <Sun className="w-7 h-7 text-yellow-500 fill-yellow-500 transition-transform hover:rotate-12" />
      ) : (
        <Moon className="w-7 h-7 text-yellow-500 fill-yellow-500 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}