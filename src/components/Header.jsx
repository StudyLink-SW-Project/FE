// src/components/Header.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../store/authThunks';
import UserMenu from './UserMenu';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import userIcon from '../assets/user_icon.png';

// public 폴더에 있는 로고 파일을 경로로 직접 사용
const LOGO_LIGHT = '/logo_black.png'; // 라이트 모드에 검정 로고
const LOGO_DARK  = '/logo_white.png'; // 다크 모드에 흰색 로고

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = !!user;

  const { theme, toggle } = useTheme();
  const logoSrc = theme === 'light' ? LOGO_LIGHT : LOGO_DARK;

  const handleLogout = async () => {
    await dispatch(logoutThunk()).unwrap();
    setMenuOpen(false);
  };

  return (
    <header className="bg-background text-foreground flex justify-between items-center px-8 py-4 h-20 border-b border-gray-200 dark:border-gray-700">
      {/* 로고 + 내비게이션 */}
      <div className="flex items-center gap-6">
        <Link to="/">
          <img src={logoSrc} alt="Study Link Logo" className="h-10" />
        </Link>
        <nav className="flex gap-4">
          <Link to="/" className="px-4 py-2 font-semibold hover:text-primary">홈</Link>
          <Link to="/study-room" className="px-4 py-2 font-semibold hover:text-primary">스터디 룸</Link>
          <Link to="/questions" className="px-4 py-2 font-semibold hover:text-primary">질문 게시판</Link>
        </nav>
      </div>

      {/* 테마 토글 + 인증 상태 UI */}
      <div className="flex items-center gap-4">
        {/* 다크/라이트 토글 */}
        <button
          onClick={toggle}
          className="p-2 rounded-full hover:bg-background/20 transition"
          aria-label="테마 전환"
        >
          {theme === 'light'
            ? <Moon className="w-5 h-5 text-foreground" />
            : <Sun  className="w-5 h-5 text-foreground" />
          }
        </button>

        {isAuthenticated ? (
          <div className="relative">
            <button onClick={() => setMenuOpen(prev => !prev)}>
              <img src={userIcon} alt="User" className="w-10 h-10 rounded-full" />
            </button>
            {menuOpen && (
              <UserMenu
                onClose={() => setMenuOpen(false)}
                onLogout={handleLogout}
              />
            )}
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="
                px-4 py-3 rounded-full
                text-white
                font-semibold
                border border-black
                bg-black
                dark:bg-white dark:text-black
                hover:bg-slate-200
                transition
              "
            >
              로그인
            </Link>
            <Link
              to="/signup"
              className="px-3 py-3 rounded-full border border-primary text-primary font-semibold hover:bg-slate-200 transition"
            >
              회원가입
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
