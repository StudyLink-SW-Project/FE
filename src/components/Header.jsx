// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { logoutThunk } from '../store/authThunks';
// import userIcon from '../assets/user_icon.png';
// import UserMenu from './UserMenu';
// import { Sun, Moon } from 'lucide-react';
// import { useTheme } from '../contexts/ThemeContext';

// export default function Header() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const dispatch = useDispatch();
//   const user = useSelector(state => state.auth.user);
//   const isAuthenticated = !!user;

//   const handleLogout = async () => {
//     await dispatch(logoutThunk()).unwrap();
//     setMenuOpen(false);
//   };

//   const { theme, toggle } = useTheme();

//   return (
//     <header className="bg-[#1D1F2C] text-white flex justify-between items-center px-8 py-4 h-20 border-b border-[#616680]">
//       {/* 로고 + 네비게이션 */}
//       <div className="flex items-center gap-15">
//         <Link to="/">
//           <img src="/logo_white.png" alt="Study Link Logo" className="h-20" />
//         </Link>
//         <nav className="flex gap-6">
//           <Link to="/" className="hover:text-gray-300 font-semibold px-10 py-1">홈</Link>
//           <Link to="/study-room" className="hover:text-gray-300 font-semibold px-10 py-1">스터디 룸</Link>
//           <Link to="/questions" className="hover:text-gray-300 font-semibold px-10 py-1">질문 게시판</Link>
//         </nav>
//       </div>

//       {/* 로그인 상태에 따른 UI */}
//       <div className="flex items-center gap-4">
//       {/* 테마 토글 버튼 */}
//         <button
//           onClick={toggle}
//           className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
//           aria-label="테마 전환"
//        >
//           {theme === 'light' ? <Moon className="w-5 h-5 text-black" /> : <Sun className="w-5 h-5 text-white" />}
//         </button>
//         {isAuthenticated ? (
//           <div className="relative">
//             <button onClick={() => setMenuOpen(prev => !prev)}>
//               <img src={userIcon} alt="User" className="w-13 h-13 rounded-full" />
//             </button>
//             {menuOpen && (
//               <UserMenu onClose={() => setMenuOpen(false)} onLogout={handleLogout} />
//             )}
//           </div>
//         ) : (
//           <>
//             <Link
//               to="/login"
//               className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-300"
//             >
//               로그인
//             </Link>
//             <Link
//               to="/signup"
//               className="border border-white px-5 py-3 rounded-full font-semibold hover:bg-gray-700"
//             >
//               회원가입
//             </Link>
//           </>
//         )}
//       </div>
//     </header>
//   );
// }
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
              className="px-4 py-2 rounded-full bg-primary text-white font-semibold hover:bg-primary/80 transition"
            >
              로그인
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-full border border-primary text-primary font-semibold hover:bg-primary/10 transition"
            >
              회원가입
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
