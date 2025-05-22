// src/components/Header.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutThunk } from '../store/authThunks';
import userIcon from '../assets/user_icon.png';
import UserMenu from './UserMenu';
import ProfileModal from './modals/ProfileModal';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isAuthenticated = !!user;

  // avatar 상태 관리
  const initialAvatar = localStorage.getItem('avatar') || user?.avatarUrl || userIcon;
  const [avatar, setAvatar] = useState(initialAvatar);

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
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      setMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      <header className="bg-[#1D1F2C] text-white flex justify-between items-center px-8 py-4 h-20 border-b border-[#616680] relative z-50">
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

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <div className="flex items-start gap-4 relative">
              {/* 유저 아이콘 */}
              <button onClick={() => setMenuOpen(prev => !prev)}>
                <img
                  src={avatar}
                  alt="User"
                  className="cursor-pointer w-16 h-16 rounded-full border-2 border-gray-600"
                />
              </button>

              {/* 우측: 환영 메시지와 로그아웃 버튼 */}
              <div className="flex flex-col mt-3">
                <span className="text-sm font-semibold">
                  {user.userName}님 환영합니다
                </span>
                <button
                  onClick={handleLogout}
                  className="mt-1 w-14 py-0.5 bg-red-500 rounded text-xs font-medium hover:bg-red-600 cursor-pointer transition"
                >
                  로그아웃
                </button>
              </div>

              {/* 드롭다운 메뉴 */}
              {menuOpen && (
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2">
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
      </header>
    </>
  );
}
