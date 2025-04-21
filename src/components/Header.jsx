// src/components/Header.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
          className="
            bg-gray-900 text-white
            flex justify-between items-center
            px-8           /* 좌우 패딩을 8로 늘려서 여백 확보 */
            py-4           /* 상하 패딩을 4로 늘려서 높이 확보 */
           h-20           /* 고정 높이 5rem(80px) 지정 */
          ">      
    <div className="flex items-center gap-15">
        <Link to="/">
          <img src="/logo.png" alt="Study Link Logo" className="h-20" />
        </Link>
        <nav className="flex gap-6">
        <Link to="/"            className="hover:text-gray-300 px-10 py-1">홈</Link>
        <Link to="/study-room"  className="hover:text-gray-300 px-10 py-1">스터디 룸</Link>
        <Link to="/questions"   className="hover:text-gray-300 px-10 py-1">질문 게시판</Link>
        </nav>
      </div>
      <div className="relative">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          <img src="/user_icon.png" alt="User" className="w-15 h-15 rounded-full" />
        </button>
        {menuOpen && <UserMenu />}
      </div>
    </header>
  );
}
