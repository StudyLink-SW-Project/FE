// src/components/UserMenu.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../store/authThunks';
import { toast } from 'react-toastify';
import { User as UserIcon, FileText, LogOut } from 'lucide-react';
import userIcon from '../assets/user_icon.png';

export default function UserMenu({ onClose, onOpenProfile, onAvatarChange }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  // ① 아바타 상태: 로컬Storage 우선, 없으면 user.avatarUrl, 없으면 기본 아이콘
  const [avatar, setAvatar] = useState(
    localStorage.getItem('avatar') ||
    user?.avatarUrl ||
    userIcon
  );

  // ② 사진 변경 핸들러
  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setAvatar(dataUrl);
      localStorage.setItem('avatar', dataUrl);
      onAvatarChange?.(dataUrl);
    };
    reader.readAsDataURL(file);
  };

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

  return (
    <div className="absolute -right-10 w-56 max-h-[calc(100vh-4rem)] overflow-auto bg-gray-200 text-black rounded shadow-md z-50">
      <div className="p-3 border-b border-stone-100">
        <div className="flex items-center">
          {/* 클릭 가능한 아바타로 감싸기 */}
          <label className="relative mr-3 cursor-pointer">
            <img
              src={avatar}
              alt="User"
              className="w-18 h-18 rounded-full"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
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
          className="px-4 py-3 border-b border-stone-100 hover:bg-gray-400 cursor-pointer flex items-center gap-2"
          onClick={handleProfileClick}
        >
          <UserIcon className="w-5 h-5 text-gray-600" />
          내 프로필
        </li>
        <li className="px-4 py-3 border-b border-stone-100 hover:bg-gray-400 cursor-pointer flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          내 질문
        </li>
        <li
          className="px-4 py-3 hover:bg-red-100 cursor-pointer flex items-center gap-2 text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </li>
      </ul>
    </div>
  );
}
