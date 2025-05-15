// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import userIcon from '../assets/user_icon.png';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  // ① avatar 상태: 로컬 스토리지 우선, 없으면 user.avatarUrl, 없으면 기본 아이콘
  const [avatar, setAvatar] = useState(
    localStorage.getItem('avatar') ||
    user?.avatarUrl ||
    userIcon
  );
  // ② 파일 선택 핸들러
  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      localStorage.setItem('avatar', reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-purple-300 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
        {/* 아바타 영역 */}
        <div className="flex justify-center -mt-16 mb-6">
        <div
          className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200"
          style={{
            backgroundImage: `url(${avatar})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>

      {/* ③ 프로필 사진 파일 선택 */}
      <div className="text-center mb-6">
        <label className="cursor-pointer inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded">
          사진 변경
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </label>
      </div>
        {/* 사용자 정보 카드 */}
        <div className="text-center mb-6 space-y-2">
          <h2 className="text-2xl font-semibold">{user?.userName}</h2>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        {/* 정보 섹션 */}
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="w-24 text-gray-500">이름</span>
            <span className="font-medium">{user?.userName}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 text-gray-500">이메일</span>
            <span className="font-medium">{user?.email}</span>
          </div>
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-block bg-transparent text-indigo-400 hover:text-indigo-200 font-medium"
          >
            &larr; 뒤로가기
          </button>
        </div>
      </div>
    </div>
  );
}
