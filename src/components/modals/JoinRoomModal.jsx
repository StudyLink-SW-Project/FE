// src/components/JoinRoomModal.jsx
import { useState, useEffect } from "react";
import { Users, Lock, Eye, EyeOff, X } from "lucide-react";

export default function JoinRoomModal({ room, isOpen, onClose, onEnter }) {
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // 모달 열 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setShowPwd(false);
    }
  }, [isOpen]);

  if (!isOpen || !room) return null;

  const handleEnter = (e) => {
    e.preventDefault();
    onEnter(room.id, password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1D1F2C] rounded-xl w-full max-w-sm p-6 relative text-white">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 타이틀 + 참여인원 */}
        <h2 className="text-xl font-semibold mb-2">{room.title}</h2>
        <div className="flex items-center mb-4 text-sm">
          <Users className="w-5 h-5 mr-1" />
          {room.participants}/{room.maxParticipants}
        </div>

        {/* 일러스트 */}
        <img
          src={room.imageSrc}
          alt={room.title}
          className="w-full h-32 object-cover rounded-md mb-4"
        />

        {/* 설명 */}
        <p className="text-gray-300 mb-6">{room.subtitle}</p>

        {/* 비밀번호 입력 (조건부) */}
        {room.isLocked && (
          <div className="mb-6">
            <label className="flex items-center text-sm mb-1 text-gray-400">
              <Lock className="w-4 h-4 mr-1" />
              비밀번호
            </label>
            <div className="flex items-center border-b border-gray-600">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요.."
                className="flex-1 bg-transparent py-2 outline-none placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="text-gray-500"
              >
                {showPwd ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* 입장 버튼 */}
        <button
          onClick={handleEnter}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white font-medium transition"
        >
          입장
        </button>
      </div>
    </div>
  );
}
