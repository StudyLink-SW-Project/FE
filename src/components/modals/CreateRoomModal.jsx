// src/components/CreateRoomModal.jsx
import { useEffect, useState } from "react";
import { Home, FileText, Lock, Eye, EyeOff, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// 토큰 발급 서버
const APP_SERVER = "https://api.studylink.store/";

export default function CreateRoomModal({ isOpen, onClose, onCreate, onEnter }) {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const participantName = user?.userName || "Guest";

  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [maxUsers, setMaxUsers] = useState(16);
  const [bgFile, setBgFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRoomName("");
      setDescription("");
      setPassword("");
      setShowPwd(false);
      setMaxUsers(16);
      setBgFile(null);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#1D1F2C] rounded-2xl w-full max-w-md p-8 relative text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-200">✕</button>
        <h2 className="text-2xl font-semibold mb-6">스터디 룸 생성 및 입장</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form className="space-y-6" onSubmit={async e => {
          e.preventDefault();
          setError("");
          try {
            // 1) 방 생성
            onCreate({ roomName, description, password, maxUsers, bgFile, isLocked: password.trim() !== "" });
            // 2) 토큰 발급
            const res = await fetch(`${APP_SERVER}api/v1/video/token`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roomName: String(roomName), participantName }),
            });
            if (!res.ok) throw new Error("토큰 서버 오류");
            const { token } = await res.json();
            // 3) 입장
            onEnter(String(roomName), token);
            onClose();
          } catch (err) {
            setError(err.message);
          }
        }}>
          {/* 방 이름 */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">방 이름</label>
            <div className="flex items-center border-b border-gray-600 pb-1">
              <Home className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="방 이름을 입력하세요.."
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
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
                onChange={e => setDescription(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
              />
            </div>
          </div>
          {/* 비밀번호 */}
          <div>
            <label className="flex items-center text-sm text-gray-300 mb-1">
              <Lock className="w-4 h-4 mr-1" /> 비밀번호
            </label>
            <div className="flex items-center border-b border-gray-600 pb-1">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="비밀번호를 설정하세요.."
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} className="cursor-pointer text-gray-400">
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {/* 배경 업로드 & 인원 수 */}
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-300 cursor-pointer">
              <Image className="w-5 h-5 mr-1 text-gray-400" /> 배경 업로드
              <input type="file" accept="image/*" onChange={e => setBgFile(e.target.files[0])} className="sr-only" />
            </label>
            <div className="flex items-center">
              <span className="text-sm text-gray-300 mr-2">인원 수 설정</span>
              <select value={maxUsers} onChange={e => setMaxUsers(+e.target.value)} className="cursor-pointer bg-transparent border border-gray-600 text-gray-400 rounded px-2 py-1 outline-none">
                {[4,8,12,16,20].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          {/* 버튼 */}
          <div className="mt-8">
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition cursor-pointer">
              생성 후 입장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
