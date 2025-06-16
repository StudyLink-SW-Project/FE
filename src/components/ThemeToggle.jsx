// src/components/ThemeToggle.jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ className = "" }) {
  const {toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-900 dark:hover:bg-gray-100 border border-gray-300 dark:border-gray-100 ${className}`}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500 transition-transform hover:rotate-12" />
      ) : (
        <Moon className="w-5 h-5 text-gray-300 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}