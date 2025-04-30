// src/components/JoinRoomModal.jsx
import { useState, useEffect } from "react";
import { Users, Lock, Eye, EyeOff, X } from "lucide-react";

export default function JoinRoomModal({ room, isOpen, onClose, onEnter }) {
  const [name, setName] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 모달 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setName("");
      setPassword("");
      setShowPwd(false);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !room) return null;

  async function handleEnter(e) {
    e.preventDefault();
    setError("");
    try {
      // 1) 토큰 발급 요청
      const res = await fetch(`${import.meta.env.VITE_APP_SERVER || 'http://localhost:6080/' }token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: String(room.id),
          participantName: name || `Guest_${Math.random().toString(36).slice(2,6)}`,
        }),
      });
      if (!res.ok) throw new Error("토큰 서버 오류");
      const { token } = await res.json();

      // 2) 상위 컴포넌트 onEnter로 위임
      onEnter(String(room.id), token, name || `Guest_${Math.random().toString(36).slice(2,6)}`);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1D1F2C] rounded-xl w-full max-w-sm p-6 relative text-white">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center">{room.title}</h2>

        <form onSubmit={handleEnter} className="space-y-4">
          <div>
            <label className="text-sm mb-1 text-gray-400">닉네임</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full bg-transparent border-b border-gray-600 py-2 outline-none placeholder-gray-500 text-white"
              required
            />
          </div>

          {room.isLocked && (
            <div>
              <label className="flex items-center text-sm mb-1 text-gray-400">
                <Lock className="w-4 h-4 mr-1" /> 비밀번호
              </label>
              <div className="flex items-center border-b border-gray-600">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="flex-1 bg-transparent py-2 outline-none placeholder-gray-500 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="text-gray-500"
                >
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition"
          >
            입장
          </button>
        </form>
      </div>
    </div>
  );
}
