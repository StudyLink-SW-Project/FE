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
                      <LogOut className="w-7 h-7 text-gray-300 group-hover:text-red-400 transition-colors" />
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


// 반응형
// // src/components/Header.jsx
// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { logoutThunk } from '../store/authThunks';
// import { LogOut, Menu, X } from 'lucide-react'; // 햄버거 메뉴 아이콘 추가
// import userIcon from '../assets/default.png';
// import UserMenu from './UserMenu';
// import ProfileModal from './modals/ProfileModal';

// export default function Header() {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showProfileModal, setShowProfileModal] = useState(false);
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // 모바일 메뉴 상태
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024); // 모바일 여부 상태

//   const dispatch = useDispatch();
//   const user = useSelector(state => state.auth.user);
//   const isAuthenticated = !!user;

//   // avatar 상태 관리
//   const initialAvatar = localStorage.getItem('avatar') || user?.avatarUrl || userIcon;
//   const [avatar, setAvatar] = useState(initialAvatar);

//   // 화면 크기 감지
//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 1024);
//       // 데스크탑 사이즈에서는 모바일 메뉴 자동 닫기
//       if (window.innerWidth >= 1024 && mobileMenuOpen) {
//         setMobileMenuOpen(false);
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, [mobileMenuOpen]);

//   // 다른 탭에서 avatar 변경 시 동기화
//   useEffect(() => {
//     const onStorage = e => {
//       if (e.key === 'avatar') {
//         setAvatar(e.newValue || user?.avatarUrl || userIcon);
//       }
//     };
//     window.addEventListener('storage', onStorage);
//     return () => window.removeEventListener('storage', onStorage);
//   }, [user]);

//   const handleOpenProfile = () => {
//     setShowProfileModal(true);
//     setMenuOpen(false);
//     setMobileMenuOpen(false);
//   };

//   const handleLogout = async () => {
//     try {
//       await dispatch(logoutThunk()).unwrap();
//       setMenuOpen(false);
//       setMobileMenuOpen(false);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleLogoutClick = () => {
//     setShowLogoutModal(true);
//   };

//   const handleConfirmLogout = () => {
//     handleLogout();
//     setShowLogoutModal(false);
//   };

//   const handleCancelLogout = () => {
//     setShowLogoutModal(false);
//   };

//   return (
//     <>
//       {showProfileModal && (
//         <ProfileModal onClose={() => setShowProfileModal(false)} />
//       )}

//       <header className="bg-[#1D1F2C] text-white flex justify-between items-center px-4 lg:px-8 py-4 h-20 border-b border-[#616680] relative z-50">
//         {/* 로고 & 햄버거 메뉴 (모바일) */}
//         <div className="flex items-center gap-4">
//           {/* 모바일 햄버거 버튼 */}
//           <button 
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-all"
//             aria-label="메뉴 열기"
//           >
//             {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
//           </button>

//           <Link to="/" className="flex-shrink-0">
//             <img 
//               src="/logo_white.png" 
//               alt="Study Link Logo" 
//               className="h-14 lg:h-20" // 모바일에서 로고 크기 조정
//             />
//           </Link>
//         </div>

//         {/* 데스크탑 네비게이션 */}
//         <nav className="hidden lg:flex gap-8">
//           <Link to="/" className="hover:text-gray-300 font-medium text-xl px-4 py-2 transition-all duration-200 hover:scale-105">홈</Link>
//           <Link to="/study-room" className="hover:text-gray-300 font-medium text-xl px-4 py-2 transition-all duration-200 hover:scale-105">스터디 룸</Link>
//           <Link to="/questions" className="hover:text-gray-300 font-medium text-xl px-4 py-2 transition-all duration-200 hover:scale-105">질문 게시판</Link>
//         </nav>

//         {/* 우측 메뉴 영역 */}
//         <div className="flex items-center gap-4 lg:gap-6">
//           {isAuthenticated ? (
//             <div className="flex items-start gap-4 relative">
//               {/* 유저 아이콘 */}
//               <button onClick={() => setMenuOpen(prev => !prev)}>
//                 <img
//                   src={avatar}
//                   alt="User"
//                   className="cursor-pointer w-12 h-12 lg:w-16 lg:h-16 rounded-full border-2 border-gray-600"
//                 />
//               </button>

//               {/* 데스크탑: 환영 메시지와 로그아웃 아이콘 */}
//               <div className="hidden lg:flex flex-col mt-2 lg:mt-3">
//                 <div className="flex items-center gap-3">
//                   <span className="text-base font-medium tracking-wide">
//                     <span className="font-light text-xl">{user.userName}님</span>
//                   </span>
//                   <div>
//                     <button
//                       onClick={handleLogoutClick}
//                       className="p-2 hover:bg-gray-700 rounded-lg transition-all duration-200 cursor-pointer group"
//                       title="로그아웃"
//                     >
//                       <LogOut className="w-6 h-6 lg:w-7 lg:h-7 text-gray-300 group-hover:text-white transition-colors" />
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* 드롭다운 메뉴 */}
//               {menuOpen && (
//                 <div className="absolute top-full mt-2 right-0 lg:left-1/2 lg:transform lg:-translate-x-1/2">
//                   <UserMenu
//                     onClose={() => setMenuOpen(false)}
//                     onOpenProfile={handleOpenProfile}
//                     onAvatarChange={setAvatar}
//                   />
//                 </div>
//               )}
//             </div>
//           ) : (
//             <>
//               {/* 데스크탑: 로그인/회원가입 버튼 */}
//               <div className="hidden lg:flex gap-4">
//                 <Link
//                   to="/login"
//                   className="bg-white text-black px-6 py-2 lg:px-8 lg:py-3 rounded-full font-medium text-base lg:text-lg tracking-wide hover:bg-gray-100 transition-all duration-200 hover:scale-105"
//                 >
//                   로그인
//                 </Link>
//                 <Link
//                   to="/signup"
//                   className="border border-white px-5 py-2 lg:px-7 lg:py-3 rounded-full font-medium text-base lg:text-lg tracking-wide hover:bg-white/10 transition-all duration-200 hover:scale-105"
//                 >
//                   회원가입
//                 </Link>
//               </div>
//             </>
//           )}
//         </div>

//         {/* 모바일 메뉴 오버레이 */}
//         {mobileMenuOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden" 
//                onClick={() => setMobileMenuOpen(false)}></div>
//         )}

//         {/* 모바일 슬라이드 메뉴 */}
//         <div className={`fixed top-0 left-0 h-full w-4/5 max-w-sm bg-[#1D1F2C] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
//           <div className="p-6 h-full flex flex-col">
//             {/* 모바일 메뉴 헤더 */}
//             <div className="flex justify-between items-center pb-6 border-b border-[#616680]">
//               <Link to="/" onClick={() => setMobileMenuOpen(false)}>
//                 <img 
//                   src="/logo_white.png" 
//                   alt="Study Link Logo" 
//                   className="h-14"
//                 />
//               </Link>
//               <button 
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="p-2 rounded-lg hover:bg-gray-700"
//               >
//                 <X size={28} />
//               </button>
//             </div>

//             {/* 모바일 네비게이션 */}
//             <nav className="flex flex-col mt-6 space-y-4 flex-grow">
//               <Link 
//                 to="/" 
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="hover:text-gray-300 font-medium text-xl px-4 py-3 transition-all duration-200 border-b border-[#616680]"
//               >
//                 홈
//               </Link>
//               <Link 
//                 to="/study-room" 
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="hover:text-gray-300 font-medium text-xl px-4 py-3 transition-all duration-200 border-b border-[#616680]"
//               >
//                 스터디 룸
//               </Link>
//               <Link 
//                 to="/questions" 
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="hover:text-gray-300 font-medium text-xl px-4 py-3 transition-all duration-200 border-b border-[#616680]"
//               >
//                 질문 게시판
//               </Link>
//             </nav>

//             {/* 모바일 인증 버튼 / 유저 정보 */}
//             <div className="pt-6 border-t border-[#616680]">
//               {isAuthenticated ? (
//                 <div className="flex flex-col space-y-4">
//                   <div className="flex items-center gap-4">
//                     <img
//                       src={avatar}
//                       alt="User"
//                       className="w-12 h-12 rounded-full border-2 border-gray-600"
//                     />
//                     <div>
//                       <p className="text-xl font-medium">{user.userName}님</p>
//                       <button 
//                         onClick={handleOpenProfile}
//                         className="text-blue-400 hover:text-blue-300 mt-1"
//                       >
//                         프로필 보기
//                       </button>
//                     </div>
//                   </div>
                  
//                   <button
//                     onClick={handleLogoutClick}
//                     className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
//                   >
//                     <LogOut size={20} />
//                     <span>로그아웃</span>
//                   </button>
//                 </div>
//               ) : (
//                 <div className="flex flex-col space-y-4">
//                   <Link
//                     to="/login"
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="bg-white text-black text-center py-3 rounded-lg font-medium text-lg tracking-wide hover:bg-gray-100 transition-colors"
//                   >
//                     로그인
//                   </Link>
//                   <Link
//                     to="/signup"
//                     onClick={() => setMobileMenuOpen(false)}
//                     className="border border-white text-center py-3 rounded-lg font-medium text-lg tracking-wide hover:bg-white/10 transition-colors"
//                   >
//                     회원가입
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* 로그아웃 확인 모달 */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 z-[9999] flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
//             <p className="text-lg text-black font-semibold mb-6">로그아웃 하시겠습니까?</p>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={handleConfirmLogout}
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
//               >
//                 예
//               </button>
//               <button
//                 onClick={handleCancelLogout}
//                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 cursor-pointer"
//               >
//                 아니오
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }