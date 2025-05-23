// src/components/Header.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutThunk } from '../store/authThunks';
import { Menu, X } from 'lucide-react';
import userIcon from '../assets/user_icon.png';
import UserMenu from './UserMenu';
import ProfileModal from './modals/ProfileModal';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = !!user;

  const initialAvatar = localStorage.getItem('avatar') || user?.avatarUrl || userIcon;
  const [avatar, setAvatar] = useState(initialAvatar);

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
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      setMenuOpen(false);
      setMobileOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}

      <header className="bg-[#1D1F2C] text-white px-4 md:px-8 h-20 flex items-center justify-between border-b border-[#616680] relative z-50">
        {/* 로고 + 네비 (1024px 이상에서만) */}
        <div className="flex items-center gap-4 sm:gap-15">
          <Link to="/" className="flex items-center">
            <img src="/logo_white.png" alt="Logo" className="h-10 md:h-20" />
          </Link>
          <nav className="hidden lg:flex gap-6">
            <Link to="/" className="hover:text-gray-300 font-semibold px-10 py-1">홈</Link>
            <Link to="/study-room" className="hover:text-gray-300 font-semibold px-10 py-1">스터디 룸</Link>
            <Link to="/questions" className="hover:text-gray-300 font-semibold px-10 py-1">질문 게시판</Link>
          </nav>
        </div>

        {/* 로그인/회원가입(또는 아바타) + 햄버거 */}
        <div className="flex items-center gap-4">
          {/* 로그인/회원가입 or 아바타 (640px 이상에서만) */}
          <div className="hidden sm:flex items-center gap-6">
            {isAuthenticated ? (
              <div className="flex items-start gap-4 relative">
                <button onClick={() => setMenuOpen(o => !o)}>
                  <img
                    src={avatar}
                    alt="User"
                    className="w-16 h-16 rounded-full border-2 border-gray-600 cursor-pointer"
                  />
                </button>
                <div className="flex flex-col mt-2">
                  <span className="text-sm font-semibold">{user.userName}님</span>
                  <button
                    onClick={handleLogout}
                    className="mt-1 w-14 py-0.5 bg-red-500 rounded text-xs font-medium hover:bg-red-600 transition"
                  >
                    로그아웃
                  </button>
                </div>
                {menuOpen && (
                  <div className="absolute top-full mt-2 right-0">
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

          {/* 햄버거 버튼 (1024px 미만에서만) */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="메뉴 열기/닫기"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* 모바일 드롭다운 메뉴 (1024px 미만에서만) */}
        {mobileOpen && (
          <div className="absolute top-full left-0 w-full bg-[#1D1F2C] border-b border-[#616680] flex flex-col items-center py-4 space-y-4 lg:hidden">
            <nav className="flex flex-col items-center gap-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="hover:text-gray-300 font-semibold">
                홈
              </Link>
              <Link to="/study-room" onClick={() => setMobileOpen(false)} className="hover:text-gray-300 font-semibold">
                스터디 룸
              </Link>
              <Link to="/questions" onClick={() => setMobileOpen(false)} className="hover:text-gray-300 font-semibold">
                질문 게시판
              </Link>
            </nav>
            {isAuthenticated ? (
              <>
                <button onClick={handleOpenProfile} className="text-white font-semibold">프로필</button>
                <button onClick={handleLogout} className="text-red-500 font-semibold">로그아웃</button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 sm:hidden">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="bg-white text-black px-5 py-2 rounded-full font-semibold hover:bg-gray-300 w-3/4 text-center"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="border border-white px-7 py-2 rounded-full font-semibold hover:bg-gray-700 w-3/4 text-center"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
