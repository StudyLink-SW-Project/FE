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
import GoalSettingsModal from "../components/modals/GoalSettingsModal";

// LiveKit 서버 URL
const LIVEKIT_URL = "wss://api.studylink.store:443";
// 백엔드 방 설정 저장 API 베이스
const API = import.meta.env.VITE_APP_SERVER;

export default function StudyRoomEntry() {
  const { state }   = useLocation();
  const token       = state?.token;
  const roomName    = state?.roomName;
  const roomDescription = state?.roomDescription;
  const password    = state?.password;
  const img         = state?.img;
  

  const navigate    = useNavigate();

  // — 서버에서 가져올 목표/오늘 공부시간
  const [goalHours,   setGoalHours]   = useState(0);
  const [goalMinutes, setGoalMinutes] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [showChat, setShowChat] = useState(false);
  // 타이머 상태
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning,       setIsRunning]     = useState(false);
  const [showTimerSection, setShowTimerSection] = useState(false);

  // 목표 달성 모달
  const [showGoalModal, setShowGoalModal] = useState(false);
  // 목표 설정 모달
  const [showGoalSettingsModal, setShowGoalSettingsModal] = useState(false);
  // 계속 진행 선택 여부
  const [skipGoalModal, setSkipGoalModal] = useState(false);

  // 초기화 옵션 모달
  const [showModal,   setShowModal]   = useState(false);
  const [resetOption, setResetOption] = useState("stopwatch");

  // 서버 전송 대기 중인 분 단위 누적
  const [queuedMinutes, setQueuedMinutes] = useState(0);

  // GPT chat
  const [chatMessages, setChatMessages] = useState([
  { role: "assistant", content: "안녕하세요! 무엇을 도와드릴까요?" }]);
  const [chatInput, setChatInput] = useState("");
  const [isGptTyping, setIsGptTyping] = useState(false);

  async function sendMessageToGpt(messages) {
  const apiMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  const body = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "당신은 친절한 공부 도우미입니다." },
      ...apiMessages
    ]
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer ${process.env.REACT_APP_GPT_API_KEY"},
    body: JSON.stringify(body)
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}

  const handleChatSend = async () => {
  if (!chatInput.trim()) return;

  // 사용자 메시지 추가
  const newMessages = [...chatMessages, { role: "user", content: chatInput }];
  setChatMessages(newMessages);
  setChatInput("");
  setIsGptTyping(true);

  try {
    const gptReply = await sendMessageToGpt(newMessages);
    setChatMessages(msgs => [...msgs, { role: "assistant", content: gptReply }]);
  } catch (err) {
    console.error(err);
    setChatMessages(msgs => [...msgs, { role: "assistant", content: "오류가 발생했습니다." }]);
  } finally {
    setIsGptTyping(false);
  }
};

  // 서버에서 목표시간·오늘시간 불러오기
  useEffect(() => {
    async function fetchStudyInfo() {
      try {
        const res = await fetch(`${API}study/time`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('공부 정보 불러오기 실패');
        const data = await res.json();
        if (data.isSuccess && data.result) {
          const { goalStudyTime, todayStudyTime } = data.result;
          // 목표 시간 파싱
          const hourMatch = goalStudyTime.match(/(\d+)\s*시간/);
          const minMatch  = goalStudyTime.match(/(\d+)\s*분/);
          setGoalHours(hourMatch ? Number(hourMatch[1]) : 0);
          setGoalMinutes(minMatch ? Number(minMatch[1]) : 0);
          // 오늘 공부 시간 파싱
          const parseMin = str => {
            const h = Number((str.match(/(\d+)\s*시간/) || [0,0])[1] || 0);
            const m = Number((str.match(/(\d+)\s*분/)   || [0,0])[1] || 0);
            return h * 60 + m;
          };
          setTodayMinutes(parseMin(todayStudyTime));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchStudyInfo();
  }, []);

  // 스톱워치 interval
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 60);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // 오늘 누적 + 현재 세션 (분)
  const displayedTodayMinutes = todayMinutes + Math.floor(elapsedSeconds / 60);
  const goalThresholdMinutes = goalHours * 60 + goalMinutes;

  // 목표 달성 체크 (오늘 공부 시간 기준)
  useEffect(() => {
    if (!skipGoalModal && goalThresholdMinutes > 0 && displayedTodayMinutes >= goalThresholdMinutes) {
      setIsRunning(false);
      setShowGoalModal(true);
    }
  }, [displayedTodayMinutes, goalThresholdMinutes, skipGoalModal]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
  };
  const formatStudyTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}시간 ${m}분`;
  };

  if (!token) {
    return <Navigate to="/study-room" replace />;
  }

  // 방 설정 저장
  const handleConnected = async () => {
    try {
      const res = await fetch(
        `${API}room/set`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName, roomDescription: roomDescription || "" , password, roomImage: img }),
        }
      );
      if (!res.ok) throw new Error("방 설정 저장 실패");
    } catch (err) {
      console.error(err);
    }
  };

  // 초기화 옵션 선택 처리
  const handleConfirmReset = () => {
    const minutes = Math.floor(elapsedSeconds / 60);
    if (resetOption === "stopwatch") {
      setQueuedMinutes(prev => prev + minutes);
      setTodayMinutes(prev => prev + minutes);
    }
    setElapsedSeconds(0);
    setShowModal(false);
    setIsRunning(true);
  };

  // 목표 달성 모달 옵션 처리
  const handleGoalOption = (option) => {
    if (option === 'newGoal') {
      setShowGoalModal(false);
      setShowGoalSettingsModal(true);
    } else if (option === 'continue') {
      setSkipGoalModal(true);
      setShowGoalModal(false);
      setIsRunning(true);
    }
  };

  // 목표 설정 저장 후
  const handleSaveGoal = (h, m) => {
    setGoalHours(h);
    setGoalMinutes(m);
    setSkipGoalModal(false);
    setShowGoalSettingsModal(false);
  };

  return (
    <div className="h-screen bg-[#0f172a]">
      {/* 헤더 */}
      <div className="hidden sm:flex w-full items-center h-16 relative">
        <div className="flex items-center space-x-3 mt-[14px] ml-4">
          <img src="/logo_white.png" alt="Study Link Logo" className="h-20" />
          <h1 className="text-white text-4xl">{roomName}</h1>
          <h1 className="text-gray-400 text-2xl mt-[3px]">|</h1>
          <h1 className="text-gray-400 text-xl mt-[8px] -ml-1">{roomDescription}</h1>
        </div>

          {/* 채팅 토글 버튼 추가 */}
        <div className="absolute right-4 mt-6 mr-6">
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-0 bg-transparent cursor-pointer transition"
          >
            <img
              src="/gpt.png"
              alt="채팅 토글"
              className="w-12 h-12"
            />
          </button>
        </div>

        <Tooltip.Provider>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center text-white text-4xl mt-4">
            {!showTimerSection ? (
              <button
                onClick={() => {
                  setShowTimerSection(true);
                  setIsRunning(true);
                }}
                className="px-4 py-2 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-500 transition cursor-pointer"
              >
                스터디 시간 기록하기
              </button>
            ) : (
              <>
                {/* 초기화 버튼 */}
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

                {/* 진행 시간 */}
                {formatTime(elapsedSeconds)}

                {/* 재생/일시정지 */}
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

                {/* 오늘/목표 공부시간 */}
                <div className="text-xs ml-10 mt-3">
                  <h1>오늘 공부 시간</h1>
                  <h1 className="ml-3 mt-1">{formatStudyTime(displayedTodayMinutes)}</h1>
                </div>
                <div className="text-xs ml-5 mt-3">
                  <h1>목표 공부 시간</h1>
                  <h1 className="ml-3 mt-1">{formatStudyTime(goalHours * 60 + goalMinutes)}</h1>
                </div>
              </>
            )}
          </div>
        </Tooltip.Provider>
      </div>

      {/* LiveKit 룸 */}
      <div style={{ height: '92vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
        <LiveKitRoom
          data-lk-theme="default"
          serverUrl={LIVEKIT_URL}
          token={token}
          connect={true}
          audio={true}
          video={true}
          onConnected={handleConnected}
          onDisconnected={async () => {
            try {
              const pending     = Math.floor(elapsedSeconds / 60);
              const totalToSend = queuedMinutes + pending;
              if (totalToSend > 0) {
                const res = await fetch(`${API}study/${totalToSend}`, {
                  method: "POST",
                  credentials: "include",
                });
                if (!res.ok) throw new Error("공부 시간 기록 전송 실패");
              }
            } catch (err) {
              console.error(err);
            } finally {
              navigate('/study-room', {
                replace: true,
                state: {
                  savedMinutes: queuedMinutes + Math.floor(elapsedSeconds / 60),
                  showSavedModal: true
                }
              });
            }
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
            <p className="mb-6">오늘 공부 목표를 달성했습니다.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleGoalOption('continue')}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded cursor-pointer"
              >계속 진행하기</button>
              <button
                onClick={() => handleGoalOption('newGoal')}
                className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
              >목표 재설정</button>
            </div>
          </div>
        </div>
      )}

      {/* 목표 설정 모달 컴포넌트 */}
      <GoalSettingsModal
        isOpen={showGoalSettingsModal}
        goalHours={goalHours}
        goalMinutes={goalMinutes}
        onClose={() => setShowGoalSettingsModal(false)}
        onSave={handleSaveGoal}
      />

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
                onClick={() => { setShowModal(false); setIsRunning(true); }}
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

      {/* 채팅창 */}
      {showChat && (
        <div className="fixed top-20 right-4 w-80 h-96 bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col z-50">
          {/* 채팅 헤더 */}
          <div className="bg-[#212121] text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Chat GPT</h3>
            <button
              onClick={() => setShowChat(false)}
              className="text-white hover:text-gray-200 text-xl cursor-pointer"
            >
              ×
            </button>
          </div>
          
{/* 채팅 메시지 영역 */}
<div className="flex-1 p-3 overflow-y-auto bg-gray-50">
  <div className="space-y-2">
    {chatMessages.map((msg, idx) => (
      <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
        <span className={msg.role === "user" ? "bg-blue-100" : "bg-gray-200"} style={{ borderRadius: 8, padding: 6, display: "inline-block" }}>
          {msg.content}
        </span>
      </div>
    ))}
    {isGptTyping && (
      <div className="text-left text-gray-400">GPT가 답변 중...</div>
    )}
  </div>
</div>
          
{/* 메시지 입력 영역 */}
<div className="p-3 border-t border-gray-200">
  <div className="flex space-x-2">
    <input
      type="text"
      placeholder="메시지를 입력하세요..."
      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={chatInput}
      onChange={e => setChatInput(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter") handleChatSend(); }}
      disabled={isGptTyping}
    />
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition cursor-pointer text-sm"
      onClick={handleChatSend}
      disabled={isGptTyping}
    >
      전송
    </button>
  </div>
</div>
        </div>
      )}
    </div>
    
  );
  
}
