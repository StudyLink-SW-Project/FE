// src/components/UserMenu.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../store/authThunks';
import { toast } from 'react-toastify';
import userIcon from '../assets/user_icon.png';

export default function UserMenu({ onClose, onOpenProfile }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const storedAvatar = localStorage.getItem('avatar');

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
    onOpenProfile();  // Header에서 넘겨준 모달 열기 함수
    onClose();        // 메뉴 닫기
  };

  return (
    <div className="absolute right-0 mt-2 w-56 max-h-[calc(100vh-4rem)] overflow-auto bg-white text-black rounded shadow-md z-50">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <img
            src={storedAvatar || user.avatarUrl || userIcon}
            alt="User"
            className="w-14 h-14 rounded-full"
          />
          <div>
            <p className="font-semibold">{user?.userName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
      <ul className="text-sm">
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={handleProfileClick}
        >
          내 프로필
        </li>
        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
          내 질문
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={handleLogout}
        >
          로그아웃
        </li>
      </ul>
    </div>
  );
}
