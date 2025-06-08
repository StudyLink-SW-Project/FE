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
    <div className="absolute -right-21 w-64 max-h-[calc(100vh-4rem)] overflow-auto bg-gray-200 text-black rounded shadow-md z-50">
      <div className="p-3 border-b border-stone-100">
        <div className="flex items-center">
          {/* 클릭 가능한 아바타로 감싸기 */}
          <label className="relative mr-3 cursor-pointer">
            <img
              src={avatar}
              alt="User"
              className="cursor-pointer min-w-16 max-w-16 w-16 h-16 rounded-full border-2 border-gray-500 bg-gray-400"
            />
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
          <div>
            <p className="text-xl font-semibold">{user?.userName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
      <ul className="text-sm">
        <li
          className="px-4 py-3 border-b border-stone-100 hover:bg-gray-400 transition-colors duration-200 cursor-pointer flex items-center gap-2"
          onClick={handleProfileClick}
        >
          <UserIcon className="w-5 h-5 text-gray-600" />
          내 프로필
        </li>
        <li 
          className="px-4 py-3 border-b border-stone-100 hover:bg-gray-400 transition-colors duration-200 cursor-pointer flex items-center gap-2"
          onClick={handleMyQuestionsClick}
        >
          <FileText className="w-5 h-5 text-gray-600" />
          내 질문
        </li>
        <li
          className="px-4 py-3 hover:bg-red-100 transition-colors duration-200 cursor-pointer flex items-center gap-2 text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </li>
      </ul>
    </div>
  );
}