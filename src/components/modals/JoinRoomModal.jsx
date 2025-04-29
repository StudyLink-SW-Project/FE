// src/components/JoinRoomModal.jsx
import { useState, useEffect } from 'react';
import { Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const APP_SERVER = import.meta.env.VITE_APP_SERVER || 'http://localhost:6080/';

export default function JoinRoomModal({ room, isOpen, onClose }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /* 모달 열릴 때마다 초기화 */
  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !room) return null;

  async function handleEnter(e) {
    e.preventDefault();
    setError('');

    try {
      /* 1) 토큰 발급 요청 */
      const res = await fetch(`${APP_SERVER}token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: room.id,
          participantName: name || `Guest_${Math.random().toString(36).slice(2, 6)}`,
        }),
      });
      if (!res.ok) throw new Error('토큰 서버 오류');
      const { token } = await res.json();

      /* 2) StudyRoomInside 로 이동 + 닉네임·토큰 전달 */
      navigate(`/study-room/${room.id}`, { state: { token, name } });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1D1F2C] rounded-xl w-full max-w-sm p-6 relative text-white">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">{room.title}</h2>

        {/* ── 닉네임 입력 ── */}
        <label className="text-sm mb-1 text-gray-400">닉네임</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름을 입력하세요"
          className="w-full bg-transparent border-b border-gray-600 py-2 mb-6 outline-none"
          required
        />

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleEnter}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition"
        >
          입장
        </button>
      </div>
    </div>
  );
}
