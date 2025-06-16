import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  LiveKitRoom, 
  VideoConference
} from "@livekit/components-react";
import '@livekit/components-styles';
import './StudyRoomCustom.css';
import { PauseCircle, PlayCircle, RefreshCw } from "lucide-react";
import * as Tooltip from '@radix-ui/react-tooltip';
import { useGoal } from '../contexts/GoalContext';

// LiveKit 서버 URL
const LIVEKIT_URL = "wss://api.studylink.store:443";
// 백엔드 방 설정 저장 API 베이스
const API = import.meta.env.VITE_APP_SERVER;

export default function StudyRoomEntry() {
  const { state }   = useLocation();
  const token       = state?.token;
  const roomName    = state?.roomName;
  const password    = state?.password;
  const img         = state?.img;
  // Context에서 목표 시간(시간/분)을 가져와 초 단위로 변환
  const { goalHours, goalMinutes } = useGoal();
  const goalSeconds = goalHours * 3600 + goalMinutes * 60;

  const navigate    = useNavigate();

  // ⏱ 타이머 상태
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning,       setIsRunning]     = useState(false); // 시작 전에는 멈춰있음

  // 목표 달성 모달
  const [showGoalModal,    setShowGoalModal] = useState(false);

  const [showModal,       setShowModal]     = useState(false);
  const [resetOption,     setResetOption]   = useState("stopwatch"); // "stopwatch" | "all"

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

  // 목표 도달 체크
  useEffect(() => {
    if (goalSeconds != null && elapsedSeconds >= goalSeconds) {
      setIsRunning(false);
      setShowGoalModal(true);
    }
  }, [elapsedSeconds, goalSeconds]);

  // ⏱ 초를 시간:분:초 포맷으로 변환
  const formatTime = (seconds) => {
    const hours   = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs    = seconds % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
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
          roomName:  String(roomName),
          password:  String(password),      
          roomImage: String(img),
        }),
      });
      if (!res.ok) {
        throw new Error("방 설정 저장 실패");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmReset = async () => {
    try {
      if (resetOption === "stopwatch") {
        // 1) 기록된 시간을 분 단위로 환산 (초 단위는 버림)
        const minutes = Math.floor(elapsedSeconds / 60);

        // 2) 서버로 전송
        const res = await fetch(`${API}study/${minutes}`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("공부 시간 기록 전송 실패");

        console.log(`서버에 ${minutes}분 기록 전송 완료`);
      } else {
        // 전체 초기화 옵션인 경우, 필요 API가 있다면 여기에 추가
        console.log("옵션2: 공부기록까지 초기화");
      }

      // 3) 타이머 초기화 및 모달 닫기
      setElapsedSeconds(0);
      setShowModal(false);

    } catch (err) {
      console.error(err);
      alert("기록 전송 중 오류가 발생했습니다.");
    }
  };
  
  return (
    <div className="h-screen bg-[#0f172a]">
      {/* 헤더 */}
      <div>
        <div className="hidden sm:flex flex justify space-x-3 items-center h-16 ml-4">
          <img 
            src="/logo_white.png" 
            alt="Study Link Logo" 
            className="h-20 mt-5" 
          />
          <h1 className="text-white text-4xl flex justify-center items-center mt-[30px]">
            {roomName}
          </h1>
          <h1 className="text-gray-500 text-2xl flex justify-center items-center mt-[26px]">
            |
          </h1>

          {/* 공부를 시작하면 타이머 + 토글 버튼 */}
          <Tooltip.Provider>
            <div className="flex items-center text-white text-4xl mt-5 ml-120">
              
              {/* 🔄 초기화 버튼 */}
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mr-4 focus:outline-none text-white text-5xl hover:text-gray-300 transform hover:scale-102 transition duration-200 cursor-pointer"
                  >
                    <RefreshCw size={32} className="mt-2" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="top"
                    className="bg-gray-600 text-white text-sm px-3 py-2 rounded shadow z-50"
                    sideOffset={5}
                  >
                    스톱워치 초기화
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              {/* ⏱ 시간 표시 */}
              {formatTime(elapsedSeconds)}

              {/* ▶️ 일시정지/재시작 버튼 */}
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => setIsRunning(prev => !prev)}
                    className="ml-4 mt-2 focus:outline-none text-white hover:text-gray-300 transform hover:scale-102 transition duration-200 cursor-pointer"
                  >
                    {isRunning
                      ? <PauseCircle size={32} />
                      : <PlayCircle  size={32} />
                    }
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="top"
                    className="bg-gray-600 text-white text-sm px-3 py-2 rounded shadow z-50"
                    sideOffset={5}
                  >
                    {isRunning ? '공부 중지' : '공부 시작'}
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              {/* 오늘 공부 시간, 목표 시간 표기 영역 */}
              <div className="text-xs ml-10 mt-3">
                <h1 className=" ">오늘 공부 시간</h1>
                <h1 className="ml-5">00:00:00</h1>
              </div>
              <div className="text-xs ml-5 mt-3">
                <h1 className=" ">목표 공부 시간</h1>
                <h1 className="ml-5">{formatTime(goalSeconds)}</h1>
              </div>
            </div>
          </Tooltip.Provider>
        
        </div>
      </div>
      
      {/* 라이브킷 룸 */}
      <div style={{ 
        height: '92vh',  
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
          <VideoConference />
        </LiveKitRoom>
      </div>

      {/* 목표 달성 모달 */}
      {showGoalModal && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white text-black rounded-lg p-6 w-80">
            <h2 className="text-xl font-semibold mb-4">축하합니다!</h2>
            <p className="mb-6">목표 공부 시간에 도달했습니다.</p>
            <button onClick={handleCloseGoalModal} className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">
              확인
            </button>
          </div>
        </div>
      )}

      {/* 타이머 초기화 모달 */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center">
          <div className="bg-white text-black rounded-lg p-6 w-107">
            <h2 className="text-xl font-semibold mb-4">초기화 옵션 선택</h2>
            <div className="flex flex-col space-y-3 mb-6">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="resetOption"
                  value="stopwatch"
                  checked={resetOption === "stopwatch"}
                  onChange={() => setResetOption("stopwatch")}
                />
                <div>
                  <span className="font-medium">스톱워치 초기화</span><br/>
                  <span className="text-xs text-gray-600">
                    스톱워치에 표기된 공부시간은 저장되고 스톱워치를 초기화합니다
                  </span>
                </div>
              </label>
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="resetOption"
                  value="all"
                  checked={resetOption === "all"}
                  onChange={() => setResetOption("all")}
                />
                <div>
                  <span className="font-medium">공부기록 초기화</span><br/>
                  <span className="text-xs text-gray-600">
                    스톱워치에 표기된 공부시간과 스톱워치를 모두 초기화합니다
                  </span>
                </div>
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
