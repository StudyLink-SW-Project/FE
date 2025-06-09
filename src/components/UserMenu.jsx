// src/components/UserMenu.jsx
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutThunk } from '../store/authThunks';
import { toast } from 'react-toastify';
import { User as UserIcon, FileText, LogOut } from 'lucide-react';
import userIcon from '../assets/default.png';

export default function UserMenu({ onClose, onOpenProfile }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);

  // 아바타 상태: 로컬Storage 우선, 없으면 user.avatarUrl, 없으면 기본 아이콘
  const avatar = userIcon;

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      onClose();
    } catch (error) {
      console.error('로그아웃에 실패했습니다:', error);
      toast.error('로그아웃에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleProfileClick = () => {
    onOpenProfile();
    onClose();
  };

  // ★ 내 질문 페이지로 이동하는 핸들러 추가
  const handleMyQuestionsClick = () => {
    navigate('/my-questions');
    onClose();
  };

  return (
    <div className="absolute -right-16 sm:-right-21 w-56 sm:w-64 max-h-[calc(100vh-4rem)] overflow-auto bg-gray-200 text-black rounded-lg shadow-lg z-50">
      <div className="p-3 sm:p-4 border-b border-stone-100">
        <div className="flex items-center">
          {/* 클릭 가능한 아바타로 감싸기 */}
          <label className="relative mr-3 cursor-pointer">
            <img
              src={avatar}
              alt="User"
              className="cursor-pointer min-w-12 max-w-12 w-12 h-12 sm:min-w-16 sm:max-w-16 sm:w-16 sm:h-16 rounded-full border-2 border-gray-500 bg-gray-400"
            />
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
          <div className="flex-1 min-w-0">
            <p className="text-lg sm:text-xl font-semibold truncate">{user?.userName}</p>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
      <ul className="text-sm">
        <li
          className="px-3 sm:px-4 py-3 border-b border-stone-100 hover:bg-gray-400 transition-colors duration-200 cursor-pointer flex items-center gap-2 sm:gap-3"
          onClick={handleProfileClick}
        >
          <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
          <span className="text-sm sm:text-base">내 프로필</span>
        </li>
        <li 
          className="px-3 sm:px-4 py-3 border-b border-stone-100 hover:bg-gray-400 transition-colors duration-200 cursor-pointer flex items-center gap-2 sm:gap-3"
          onClick={handleMyQuestionsClick}
        >
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
          <span className="text-sm sm:text-base">내 질문</span>
        </li>
        <li
          className="px-3 sm:px-4 py-3 hover:bg-red-100 transition-colors duration-200 cursor-pointer flex items-center gap-2 sm:gap-3 text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-sm sm:text-base">로그아웃</span>
        </li>
      </ul>
    </div>
  );
}