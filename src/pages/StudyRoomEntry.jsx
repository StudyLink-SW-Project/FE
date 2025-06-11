import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { 
  LiveKitRoom, 
  VideoConference
} from "@livekit/components-react";
import '@livekit/components-styles';
import './StudyRoomCustom.css';
import { User } from "lucide-react";

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
          // 필요하다면 password, roomImage 등 다른 필드도 추가
          password: String(password),      
          roomImage: String(img)
        }),
      });
      if (!res.ok) {
        throw new Error("방 설정 저장 실패");
      }
      // 저장이 성공했을 때 추가 로직이 필요하면 여기에…
    } catch (err) {
      console.error(err);
      // 사용자에게 에러 메시지를 보여주고 싶다면 상태로 관리하셔도 좋습니다.
    }
  };

  return (
    <div>
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
          onConnected={handleConnected}      // ← 여기에 추가
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
