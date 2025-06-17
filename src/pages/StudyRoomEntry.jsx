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
import { useStudy } from '../contexts/StudyContext';

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
  const { goalHours, goalMinutes, todayTime: ctxTodayMinutes, setTodayTime } = useStudy();
  const goalSeconds = goalHours * 3600 + goalMinutes * 60;

  const navigate    = useNavigate();

  // ⏱ 타이머 상태
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning,       setIsRunning]     = useState(false); // 시작 전에는 멈춰있음
  const [showTimerSection, setShowTimerSection] = useState(false);

  // ——— 오늘 공부시간 누적용 로컬 상태 (분 단위)
  const [baseTodayMinutes, setBaseTodayMinutes] = useState(ctxTodayMinutes);

  // Context.todayTime이 바뀌면 동기화
  useEffect(() => {
    setBaseTodayMinutes(ctxTodayMinutes);
  }, [ctxTodayMinutes]);

  // 목표 달성 모달
  const [showGoalModal,    setShowGoalModal] = useState(false);

  const [showModal,       setShowModal]     = useState(false);
  const [resetOption,     setResetOption]   = useState("stopwatch"); // "stopwatch" | "all"

  const formatStudyTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}시간 ${m}분`;
  };

  // ⏱ 타이머 시작/정지 로직
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 60); // 테스트 용으로 60. 나중에 1로 바꾸기
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // 목표 도달 체크
  useEffect(() => {
    if (goalSeconds != 0 && elapsedSeconds >= goalSeconds) {
      setIsRunning(false);
      setShowGoalModal(true);
    }
  }, [elapsedSeconds, goalSeconds]);

  // 화면에 표시할 오늘 공부시간 (분 단위)
  const displayedTodayMinutes = baseTodayMinutes + Math.floor(elapsedSeconds / 60);

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

        // 3) 로컬 UI에 누적 반영 (공부기록 저장 후 초기화 옵션일 때만)     
        if (resetOption === "stopwatch") {
          setBaseTodayMinutes(prev => prev + minutes);
          setTodayTime(prev => prev + minutes);
        }
        console.log(`서버에 ${minutes}분 기록 전송 완료`);
      } else {
        // 전체 초기화 옵션인 경우, 필요 API가 있다면 여기에 추가
        console.log("옵션2: 공부기록까지 초기화");
      }

      // 3) 타이머 초기화 및 모달 닫기
      setElapsedSeconds(0);
      setShowModal(false);
      setIsRunning(true);
    } catch (err) {
      console.error(err);
      alert("기록 전송 중 오류가 발생했습니다.");
    }
  };

  const handleCloseGoalModal = () => {
    setShowGoalModal(false);
    // 추가 동작 예: 기록 저장 후 초기화
    setElapsedSeconds(0);
  };

  return (
    <div className="h-screen bg-[#0f172a]">
      {/* 헤더 */}
      <div>
        <div className="hidden sm:flex w-full items-center h-16 relative">
          {/* 1. 로고 & 방 이름: 왼쪽 끝으로 */}
          <div className="flex items-center space-x-4 mt-[14px] ml-4">
            <img 
              src="/logo_white.png" 
              alt="Study Link Logo" 
              className="h-20" 
            />
            <h1 className="text-white text-4xl">
              {roomName}
            </h1>
          </div>

          {/* 2. 타이머 영역: 컨테이너 정가운데 */}
          <Tooltip.Provider>
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center text-white text-4xl mt-4">
              {!showTimerSection ? (
                <button
                  onClick={() => setShowTimerSection(true)}
                  className="px-4 py-2 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
                >
                  스터디 시간 기록하기
                </button>
              ) : (
                <>
                  {/* 🔄 초기화 버튼 */}
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={() => { setIsRunning(false); setShowModal(true); }}
                        className="mr-4 focus:outline-none text-white text-5xl hover:text-gray-300 transform hover:scale-102 transition duration-200 cursor-pointer"
                      >
                        <RefreshCw size={32} className="mt-2" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content side="top" className="bg-gray-600 text-white text-sm px-3 py-2 rounded shadow z-50" sideOffset={5}>
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
                        {isRunning ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content side="top" className="bg-gray-600 text-white text-sm px-3 py-2 rounded shadow z-50" sideOffset={5}>
                        {isRunning ? '공부 중지' : '공부 시작'}
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>

                  {/* 오늘 공부 시간, 목표 시간 */}
                  <div className="text-xs ml-10 mt-3">
                    <h1>오늘 공부 시간</h1>
                    <h1 className="ml-3 mt-1">{formatStudyTime(displayedTodayMinutes)}</h1>
                  </div>
                  <div className="text-xs ml-5 mt-3">
                    <h1>목표 공부 시간</h1>
                    <h1 className="ml-3 mt-1">{formatStudyTime(goalSeconds / 60)}</h1>
                  </div>
                </>
              )}
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
            handleConfirmReset();
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
          <div className="bg-white text-black rounded-lg p-6 w-114">
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
                  <span className="font-medium">공부기록 저장 후 초기화</span><br/>
                  <span className="text-xs text-gray-600">
                    스톱워치에 표기된 공부시간을 저장하고 스톱워치를 초기화합니다
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
                    스톱워치에 표기된 공부시간을 저장하지 않고 스톱워치를 초기화합니다
                  </span>
                </div>
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false); 
                  setIsRunning(true);
                }}
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
