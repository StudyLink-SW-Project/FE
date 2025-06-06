// src/components/Header.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutThunk } from '../store/authThunks';
import { LogOut } from 'lucide-react';
import userIcon from '../assets/default.png';
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

    const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 로그아웃 버튼 클릭 시 모달 표시
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // 로그아웃 최종 실행
  const handleConfirmLogout = () => {
    handleLogout(); // 실제 로그아웃 처리 로직
    setShowLogoutModal(false);
  };

  // 모달 닫기
  const handleCancelLogout = () => {
    setShowLogoutModal(false);
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
          <nav className="flex gap-8">
            {/* 네비게이션 메뉴 글씨 개선 */}
            <Link to="/" className="hover:text-gray-300 font-medium text-xl px-4 py-2 transition-all duration-200 hover:scale-105">홈</Link>
            <Link to="/study-room" className="hover:text-gray-300 font-medium text-xl px-4 py-2 transition-all duration-200 hover:scale-105">스터디 룸</Link>
            <Link to="/questions" className="hover:text-gray-300 font-medium text-xl px-4 py-2 transition-all duration-200 hover:scale-105">질문 게시판</Link>
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

              {/* 우측: 환영 메시지와 로그아웃 아이콘 */}
              <div className="flex flex-col mt-3">
                {/* 환영 메시지와 로그아웃 아이콘을 같은 줄에 배치 */}
                <div className="flex items-center gap-3">
                  <span className="text-base font-medium tracking-wide">
                    <span className="font-light text-xl">{user.userName}님</span>
                  </span>
                  <div>
                    {/* 로그아웃 버튼 */}
                    <button
                      onClick={handleLogoutClick}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-200 cursor-pointer group"
                      title="로그아웃"
                    >
                      <LogOut className="w-7 h-7 text-gray-300 group-hover:text-white transition-colors" />
                    </button>

                    {/* 로그아웃 확인 모달 */}
                    {showLogoutModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-40 z-[9999] flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
                          <p className="text-lg text-black font-semibold mb-6">로그아웃 하시겠습니까?</p>
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={handleConfirmLogout}
                              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                            >
                              예
                            </button>
                            <button
                              onClick={handleCancelLogout}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 cursor-pointer"
                            >
                              아니오
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
              {/* 로그인/회원가입 버튼 글씨 개선 */}
              <Link
                to="/login"
                className="bg-white text-black px-8 py-3 rounded-full font-medium text-lg tracking-wide hover:bg-gray-100 transition-all duration-200 hover:scale-105"
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="border border-white px-7 py-3 rounded-full font-medium text-lg tracking-wide hover:bg-white/10 transition-all duration-200 hover:scale-105"
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