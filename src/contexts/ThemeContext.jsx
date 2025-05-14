// src/contexts/ThemeContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggle: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // 마운트 시 로컬저장소에서 읽거나 OS 환경에 맞춰 초기 설정
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const initial = saved
      ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.classList.add(initial);
  }, []);

  // theme 변경 시 html 클래스와 로컬저장소 업데이트
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () =>
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
