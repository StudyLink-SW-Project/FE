// src/components/Header.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import userIcon from '../assets/user_icon.png';
import UserMenu from './UserMenu';
import ProfileModal from './modals/ProfileModal';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = !!user;
  const storedAvatar = localStorage.getItem('avatar');

  // 메뉴에서 "내 프로필" 클릭 시 호출
  const handleOpenProfile = () => {
    setShowProfileModal(true);
    setMenuOpen(false);
  };

  return (
    <>
      {/* 프로필 모달 */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      <header className="bg-[#1D1F2C] text-white flex justify-between items-center px-8 py-4 h-20 border-b border-[#616680] relative">
        {/* 로고 + 네비게이션 */}
        <div className="flex items-center gap-15">
          <Link to="/">
            <img src="/logo_white.png" alt="Study Link Logo" className="h-20" />
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="hover:text-gray-300 font-semibold px-10 py-1">홈</Link>
            <Link to="/study-room" className="hover:text-gray-300 font-semibold px-10 py-1">스터디 룸</Link>
            <Link to="/questions" className="hover:text-gray-300 font-semibold px-10 py-1">질문 게시판</Link>
          </nav>
        </div>

        {/* 로그인 상태에 따른 UI */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(prev => !prev)}>
                <img
                  src={storedAvatar || user.avatarUrl || userIcon}
                  alt="User"
                  className="cursor-pointer w-10 h-10 rounded-full"
                />
              </button>
              {menuOpen && (
                <UserMenu
                  onClose={() => setMenuOpen(false)}
                  onOpenProfile={handleOpenProfile}
                />
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-300"
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="border border-white px-5 py-3 rounded-full font-semibold hover:bg-gray-700"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </header>
    </>
  );
}
