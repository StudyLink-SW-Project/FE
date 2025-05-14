// src/components/JoinRoomModal.jsx
import { useState, useEffect } from "react";
import { Users, Lock, Eye, EyeOff, X } from "lucide-react";

const APP_SERVER = import.meta.env.VITE_APP_SERVER || "http://localhost:6080";

export default function JoinRoomModal({ room, isOpen, onClose, onEnter }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

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
      const res = await fetch(`${APP_SERVER}/api/v1/video/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: String(room.id),
          participantName:
            name || `Guest_${Math.random().toString(36).slice(2, 6)}`,
        }),
      });
      if (!res.ok) throw new Error("토큰 서버 오류");
      const { token } = await res.json();
      onEnter(String(room.id), token, name);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black bg-opacity-70 dark:bg-white dark:bg-opacity-30
      ">
      <div
        className="
          bg-background text-foreground
          rounded-xl w-full max-w-sm p-6
          relative
        ">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="
            absolute top-3 right-3
            text-foreground/60 hover:text-foreground
            transition
          ">
          <X className="w-5 h-5" />
        </button>

        {/* 제목/인원 */}
        <h2 className="text-xl font-semibold mb-2">{room.title}</h2>
        <div className="flex items-center mb-4 text-sm text-foreground/70">
          <Users className="w-5 h-5 mr-1 text-foreground/70" />
          {room.participants}/{room.maxParticipants}
        </div>

        {/* 이미지 */}
        <img
          src={room.imageSrc}
          alt={room.title}
          className="w-full h-32 object-cover rounded-md mb-4"
        />

        {/* 설명 */}
        <p className="mb-6 text-foreground/50">{room.subtitle}</p>

        <form onSubmit={handleEnter}>
          {/* 닉네임 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground/70 mb-1">
              닉네임
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              required
              className="
                w-full
                bg-transparent
                border-b border-foreground/50
                py-2 outline-none
                text-foreground placeholder-foreground/50
                transition
              "
            />
          </div>

          {/* 비밀번호 입력 (잠긴 방만) */}
          {room.isLocked && (
            <div className="mb-4">
              <label className="flex items-center text-sm font-medium text-foreground/70 mb-1">
                <Lock className="w-4 h-4 mr-1 text-foreground/50" />
                비밀번호
              </label>
              <div className="flex items-center border-b border-foreground/50">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="
                    flex-1
                    bg-transparent
                    py-2 outline-none
                    text-foreground placeholder-foreground/50
                    transition
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="text-foreground/50 hover:text-foreground transition"
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

          {error && <p className="mb-2 text-red-400">{error}</p>}

          {/* 입장 버튼 */}
          <button
            type="submit"
            className="
              w-full py-2
              bg-primary text-white
              rounded-full
              hover:bg-primary/80
              transition
            "
          >
            입장
          </button>
        </form>
      </div>
    </div>
  );
}
