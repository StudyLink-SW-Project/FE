import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  LiveKitRoom, 
  VideoConference
} from "@livekit/components-react";
import '@livekit/components-styles';
import './StudyRoomCustom.css';
import { Pause, PauseCircle, Play, PlayCircle, Settings, User } from "lucide-react";

// LiveKit 서버 URL
const LIVEKIT_URL = "wss://api.studylink.store:443";
// 백엔드 방 설정 저장 API 베이스
const API = import.meta.env.VITE_APP_SERVER;

export default function StudyRoomEntry() {
  const { state } = useLocation();
  const token = state?.token;
  const roomName = state?.roomName;
  const password = state?.password;
  const img = state?.img;
  const navigate = useNavigate();

  // ⏱ 타이머 상태
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true); // 재생/정지 상태

  // ⏱ 타이머 시작/정지 로직
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // ⏱ 초를 분:초 포맷으로 변환
  const formatTime = (seconds) => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  if (!token) {
    return <Navigate to="/study-room" replace />;
  }

  // 1) 연결 성공 후 호출할 콜백
  const handleConnected = async () => {
    try {
      const res = await fetch(`${API}room/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: String(roomName),
          password: String(password),      
          roomImage: String(img)
        }),
      });
      if (!res.ok) {
        throw new Error("방 설정 저장 실패");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="bg-[#0f172a]">
        <div className="hidden sm:flex flex justify space-x-3 items-center h-11 ml-15">
          <img 
            src="/logo_white.png" 
            alt="Study Link Logo" 
            className="h-11 mt-5" 
          />
          <h1 className="text-white text-2xl flex justify-center items-center mt-5">
            {roomName}
          </h1>
          <h1 className="text-gray-500 text-xl flex justify-center items-center mt-4">
            |
          </h1>
          {/* 타이머 + 토글 버튼 */}
          <div className="flex items-center text-white text-3xl mt-3 ml-145">
            {formatTime(elapsedSeconds)}
            <button
              onClick={() => setIsRunning(prev => !prev)}
              className="
                ml-4 mt-1 focus:outline-none text-white 
                hover:text-gray-300 
                transform hover:scale-102 
                transition duration-200               
              "
            >
              {isRunning
                ? <PauseCircle size={32}/>
                : <PlayCircle size={32}/>
              }
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ 
        height: '95vh',  
        width: '100vw',   
        display: 'flex',
        flexDirection: 'column'
      }}>
        <LiveKitRoom
          data-lk-theme="default"
          serverUrl={LIVEKIT_URL}
          token={token}
          connect={true}
          audio={true}
          video={true}
          onConnected={handleConnected}
          onDisconnected={() => {
            navigate('/study-room', { replace: true });
          }}
          onError={err => console.error("LiveKit 오류:", err)}
        >
          <VideoConference/>
        </LiveKitRoom>
      </div>
    </div>
  );
}
