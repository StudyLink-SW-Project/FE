// src/components/Header.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutThunk } from '../store/authThunks';
import { LogOut, Menu, X } from 'lucide-react';
import userIcon from '../assets/default.png';
import UserMenu from './UserMenu';
import ProfileModal from './modals/ProfileModal';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = !!user;
  const { isDark } = useTheme();

  // avatar 상태 관리
  const initialAvatar = localStorage.getItem('avatar') || user?.avatarUrl || userIcon;
  const [avatar, setAvatar] = useState(initialAvatar);

  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      // 데스크탑으로 전환 시 모바일 메뉴 닫기
      if (!mobile && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // 다른 탭에서 avatar 변경 시 동기화
  useEffect(() => {
    const onStorage = e => {
      if (e.key === 'avatar') {
        setAvatar(e.newValue || user?.avatarUrl || userIcon);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user]);

  const handleOpenProfile = () => {
    setShowProfileModal(true);
    setMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      setMenuOpen(false);
      setMobileMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    handleLogout();
    setShowLogoutModal(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      <header className={`
        flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 h-16 sm:h-20 border-b relative z-[60]
        ${isDark ? 'bg-[#1D1F2C] text-white border-[#616680]' : 'bg-[#7E819A] text-white border-gray-200'}
      `}>
        {/* 7E819A */}
        {/* 왼쪽: 햄버거 메뉴 + 로고 */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* 모바일 햄버거 버튼 */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            aria-label="메뉴"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* 로고 */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src={isDark ? "/logo_white.png" : "/logo_white.png"}
              alt="Study Link Logo" 
              className="h-12 sm:h-16 lg:h-20 lg:w-22" 
            />
          </Link>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden lg:flex gap-6 xl:gap-8 ml-8">           
            <Link 
              to="/study-room" 
              className={`font-medium text-xl px-4 py-2 transition-all duration-200 hover:scale-105 ${isDark ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}
            >
              스터디 룸
            </Link>
            <Link 
              to="/questions" 
              className={`font-medium text-xl px-4 py-2 transition-all duration-200 hover:scale-105 ${isDark ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}
            >
              질문 게시판
            </Link>
          </nav>
        </div>

        {/* 오른쪽: 테마 토글 + 사용자 정보 또는 로그인 버튼 */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
          {/* 테마 토글 버튼 */}
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-start gap-3 sm:gap-4 relative">
              {/* 유저 아이콘 */}
              <button onClick={() => setMenuOpen(prev => !prev)}>
                <img
                  src={avatar}
                  alt="User"
                  className={`cursor-pointer w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                />
              </button>

              {/* 데스크탑: 환영 메시지와 로그아웃 아이콘 */}
              <div className="hidden lg:flex flex-col mt-3">
                <div className="flex items-center gap-3">
                  <span className="text-base font-medium tracking-wide">
                    <span className="font-light text-xl">{user.userName}님</span>
                  </span>
                  <div>
                    <button
                      onClick={handleLogoutClick}
                      className={`p-2 rounded-lg transition-all duration-200 cursor-pointer group ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      title="로그아웃"
                    >
                      <LogOut className={`w-7 h-7 transition-colors ${isDark ? 'text-gray-300 group-hover:text-red-400' : 'text-gray-600 group-hover:text-red-500'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 드롭다운 메뉴 */}
              {menuOpen && (
                <div className="absolute top-full mt-2 right-full lg:left-1/2 lg:transform lg:-translate-x-1/2 z-[70]">
                  <UserMenu
                    onClose={() => setMenuOpen(false)}
                    onOpenProfile={handleOpenProfile}
                    onAvatarChange={setAvatar}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 데스크탑: 로그인/회원가입 버튼 */}
              <div className="hidden sm:flex gap-3 lg:gap-4">
                <Link
                  to="/login"
                  className={`px-6 py-2 rounded-full font-medium text-base tracking-wide transition-all duration-200 hover:scale-105 ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className={`px-5 py-2 rounded-full font-medium text-base tracking-wide transition-all duration-200 hover:scale-105 border ${isDark ? 'border-white hover:bg-white/10' : 'border-white'}`}
                >
                  회원가입
                </Link>
              </div>

              {/* 모바일: 로그인 버튼만 */}
              <div className="sm:hidden">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-full font-medium text-sm tracking-wide transition-all duration-200 ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                >
                  로그인
                </Link>
              </div>
            </>
          )}
        </div>

        {/* 모바일 메뉴 오버레이 */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-[70] lg:hidden" 
            onClick={closeMobileMenu}
          ></div>
        )}

        {/* 모바일 슬라이드 메뉴 */}
        <div className={`fixed top-0 left-0 h-full w-2/3 max-w-sm z-[80] transform transition-transform duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${isDark ? 'bg-[#1D1F2C]' : 'bg-white'}`}>
          <div className="p-6 h-full flex flex-col">
            {/* 모바일 메뉴 헤더 */}
            <div className={`flex justify-between items-center pb-6 border-b ${isDark ? 'border-[#616680]' : 'border-gray-200'}`}>
              <Link to="/" onClick={closeMobileMenu}>
                <img 
                  src={isDark ? "/logo_white.png" : "/logo_black.png"}
                  alt="Study Link Logo" 
                  className="h-12"
                />
              </Link>
              <button 
                onClick={closeMobileMenu}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
              >
                <X size={24} />
              </button>
            </div>

            {/* 모바일 네비게이션 */}
            <nav className="flex flex-col mt-6 space-y-2 flex-grow">
              <Link 
                to="/study-room" 
                onClick={closeMobileMenu}
                className={`font-medium text-lg px-4 py-3 transition-all duration-200 border-b ${isDark ? 'hover:text-gray-300 border-[#616680]/50 text-white' : 'hover:text-gray-600 border-gray-200 text-gray-900'}`}
              >
                스터디 룸
              </Link>
              <Link 
                to="/questions" 
                onClick={closeMobileMenu}
                className={`font-medium text-lg px-4 py-3 transition-all duration-200 border-b ${isDark ? 'hover:text-gray-300 border-[#616680]/50 text-white' : 'hover:text-gray-600 border-gray-200 text-gray-900'}`}
              >
                질문 게시판
              </Link>
            </nav>

            {/* 모바일 인증 버튼 / 유저 정보 */}
            <div className={`pt-6 border-t ${isDark ? 'border-[#616680]' : 'border-gray-200'}`}>
              {isAuthenticated ? (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={avatar}
                      alt="User"
                      className={`w-12 h-12 rounded-full border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                    />
                    <div>
                      <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.userName}님</p>
                      <button 
                        onClick={handleOpenProfile}
                        className={`mt-1 text-sm hover:underline ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                      >
                        프로필 보기
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 rounded-lg hover:bg-red-700 transition-colors text-white"
                  >
                    <LogOut size={18} />
                    <span>로그아웃</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className={`text-center py-3 rounded-lg font-medium text-base tracking-wide transition-colors ${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                  >
                    로그인
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    className={`text-center py-3 rounded-lg font-medium text-base tracking-wide transition-colors border ${isDark ? 'border-white hover:bg-white/10 text-white' : 'border-gray-900 hover:bg-gray-900/10 text-gray-900'}`}
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-[9999] flex items-center justify-center p-4">
          <div className={`p-6 rounded-lg shadow-lg text-center w-full max-w-sm ${isDark ? 'bg-[#1D1F2C]' : 'bg-white'}`}>
            <p className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
              로그아웃 하시겠습니까?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
              >
                예
              </button>
              <button
                onClick={handleCancelLogout}
                className={`px-4 py-2 rounded cursor-pointer ${isDark ? 'bg-gray-600 text-gray-100 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}