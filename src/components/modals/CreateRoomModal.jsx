// src/components/CreateRoomModal.jsx
import { useEffect, useState } from "react";
import { Home, FileText, Lock, Eye, EyeOff, Image } from "lucide-react";

export default function CreateRoomModal({ isOpen, onClose, onCreate }) {
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [maxUsers, setMaxUsers] = useState(16);
  const [bgFile, setBgFile] = useState(null);

  // 모달이 열릴 때 입력값 초기화
  useEffect(() => {
    if (isOpen) {
      setRoomName("");
      setDescription("");
      setPassword("");
      setShowPwd(false);
      setMaxUsers(16);
      setBgFile(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      roomName,
      description,
      password,
      maxUsers,
      bgFile,
      isLocked: password.trim() !== "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#1D1F2C] rounded-2xl w-full max-w-md p-8 relative text-white">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-6">스터디 룸 생성</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 방 이름 */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">방 이름</label>
            <div className="flex items-center border-b border-gray-600 pb-1">
              <Home className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="방 이름을 입력하세요.."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
                required
              />
            </div>
          </div>

          {/* 방 소개 */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">방 소개</label>
            <div className="flex items-center border-b border-gray-600 pb-1">
              <FileText className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="방 소개 문구를 작성하세요.."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="flex items-center text-sm text-gray-300 mb-1">
              <Lock className="w-4 h-4 mr-1" />
              비밀번호
            </label>
            <div className="flex items-center border-b border-gray-600 pb-1">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="비밀번호를 설정하세요.."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="cursor-pointer text-gray-400"
              >
                {showPwd ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* 배경 업로드 & 인원 수 */}
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-300 cursor-pointer">
              <Image className="w-5 h-5 mr-1 text-gray-400" />
              배경 업로드
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBgFile(e.target.files[0])}
                className="sr-only"
              />
            </label>

            <div className="flex items-center">
              <span className="text-sm text-gray-300 mr-2">인원 수 설정</span>
              <select
                value={maxUsers}
                onChange={(e) => setMaxUsers(+e.target.value)}
                className="cursor-pointer bg-transparent border border-gray-600 text-gray-400 rounded px-2 py-1 outline-none"
              >
                {[4, 8, 12, 16, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            type="submit"
            className="cursor-pointer w-1/3 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition block mx-auto mt-10"
          >
            생성하기
          </button>
        </form>
      </div>
    </div>
  );
}
