import { useState, useEffect, useCallback } from "react";
import GoalSettingsModal from "./modals/GoalSettingsModal";
import DdaySettingsModal from "./modals/DdaySettingsModal";
import ResolutionSettingsModal from "./modals/ResolutionSettingsModal";
import { useTheme } from "../contexts/ThemeContext";

export function StudyOverview({ resolution, onResolutionChange, onGoalChange }) {
  const API = import.meta.env.VITE_APP_SERVER;
  const { isDark } = useTheme();
  
  // — 서버에서 가져올 공부시간/목표시간 상태 (분 단위)
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [goalHours, setGoalHours]       = useState(0);
  const [goalMinutes, setGoalMinutes]   = useState(0);

  // 목표 진행률 계산
  const totalGoal = goalHours * 60 + goalMinutes;
  const progress  = totalGoal > 0
    ? Math.min((todayMinutes / totalGoal) * 100, 100)
    : 0;

  // 모달 상태
  const [isGoalModalOpen, setGoalModalOpen]         = useState(false);
  const [isDdayModalOpen, setDdayModalOpen]         = useState(false);
  const [isResolutionModalOpen, setResolutionModalOpen] = useState(false);

  // D-day 상태
  const [dDays, setDDays] = useState([]);

  // — D-day 가져오는 함수
  const fetchDDays = useCallback(async () => {
    try {
      const res = await fetch(`${API}day`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("D-day API 호출 실패");
      const data = await res.json();
      if (data.isSuccess && Array.isArray(data.result)) {
        const today = new Date();
        const list = data.result
          .map(({ id, name, day }) => ({ id, name, day }))
          .filter(d => new Date(d.day) >= today)
          .sort((a, b) => new Date(a.day) - new Date(b.day));
        setDDays(list);
      } else {
        throw new Error("D-day 데이터 오류");
      }
    } catch (err) {
      console.error(err);
      setDDays([]);
    }
  }, [API]);

  // 최초 마운트 시 D-day 한 번 불러오기
  useEffect(() => {
    fetchDDays();
  }, [fetchDDays]);

  // 가장 가까운 D-day 계산
  const nearest = dDays
    .map(({ name, day }) => ({
      name,
      date: day,
      diff: (new Date(day) - new Date()) / (1000 * 60 * 60 * 24),
    }))
    .filter(item => item.diff >= 0)
    .sort((a, b) => a.diff - b.diff)[0];

  // 시간 문자열 파싱 헬퍼
  const parseTime = (str) => {
    const hoursMatch   = str.match(/(\d+)\s*시간/);
    const minutesMatch = str.match(/(\d+)\s*분/);
    const h = hoursMatch   ? Number(hoursMatch[1])   : 0;
    const m = minutesMatch ? Number(minutesMatch[1]) : 0;
    return [h, m];
  };

  // — 서버에서 공부시간·목표시간 불러오기
  useEffect(() => {
    async function fetchStudyTime() {
      try {
        const res = await fetch(`${API}study/time`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("공부 시간 API 호출 실패");
        const data = await res.json();
        if (data.isSuccess && data.result) {
          const { todayStudyTime, totalStudyTime, goalStudyTime } = data.result;
          // 오늘 공부시간
          const [tH, tM] = parseTime(todayStudyTime);
          setTodayMinutes(tH * 60 + tM);
          // 총 공부시간
          const [toH, toM] = parseTime(totalStudyTime);
          setTotalMinutes(toH * 60 + toM);
          // 목표 공부시간
          const [gH, gM] = parseTime(goalStudyTime);
          setGoalHours(gH);
          setGoalMinutes(gM);
        } else {
          throw new Error("공부 시간 데이터 오류");
        }
      } catch (err) {
        console.error(err);
        setTodayMinutes(0);
        setTotalMinutes(0);
        setGoalHours(0);
        setGoalMinutes(0);
      }
    }
    fetchStudyTime();
  }, [API]);

  // 각오 정보 가져오기
  useEffect(() => {
    async function fetchResolution() {
      try {
        const res = await fetch(`${API}user/resolve`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("각오 조회 API 실패");
        const data = await res.json();
        if (data.isSuccess && data.result && typeof data.result.resolve === "string") {
          onResolutionChange(data.result.resolve);
        } else {
          throw new Error("각오 데이터 형식 오류");
        }
      } catch (err) {
        console.error(err);
        onResolutionChange("");
      }
    }
    fetchResolution();
  }, [API, onResolutionChange]);


  // 화면 크기에 따라 모바일 여부 판단
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 각오 표시용 (모바일: 최대 8자, 그 외: 최대 15자)
  const maxLen = isMobile ? 8 : 15;
  const displayResolution = resolution
    ? (resolution.length > maxLen
        ? resolution.slice(0, maxLen) + "..."
        : resolution)
    : "";

  // D-day 이름 표시용 (모바일: 최대 6자, 그 외: 최대 13자)
  const maxDdayLen = isMobile ? 6 : 13;
  const displayDdayName = nearest
    ? (nearest.name.length > maxDdayLen
        ? nearest.name.slice(0, maxDdayLen) + "..."
        : nearest.name)
    : "";

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
      {/* 첫 번째 행: 오늘/목표 공부시간 & 총 공부시간 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        {/* 오늘/목표 카드 */}
        <div className={`col-span-1 lg:col-span-2 rounded-lg p-4
          ${isDark? "bg-[#3B3E4B] text-white" : "bg-white text-black"}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">오늘 / 목표 공부 시간</span>
            <button 
              className="text-xs text-blue-400 hover:underline"
              onClick={() => setGoalModalOpen(true)}
            >
              목표 설정
            </button>
          </div>
          <div className="font-bold text-lg mb-2">
            {Math.floor(todayMinutes/60)}시간 {todayMinutes%60}분 / {goalHours}시간 {goalMinutes}분
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 mb-1">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-blue-400">{Math.floor(progress)}% 달성</span>
        </div>

        {/* 총 공부시간 카드 */}
        <div className={`col-span-1 rounded-lg p-4
          ${isDark? "bg-[#3B3E4B] text-white" : "bg-white text-black"}`}>
          <span className="font-medium block mb-2">총 공부 시간</span>
          <div className="font-bold text-lg">
            {Math.floor(totalMinutes/60)}시간 {totalMinutes%60}분
          </div>
        </div>
      </div>

      {/* 두 번째 행: D-day & 각오 */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-2 lg:w-3/4">
        {/* D-day 카드 */}
        <div className={`rounded-lg p-4
          ${isDark? "bg-[#3B3E4B] text-white" : "bg-white text-black"}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">D-Day</span>
            <button 
              className="text-xs text-blue-400 hover:underline"
              onClick={() => setDdayModalOpen(true)}
            >
              설정
            </button>
          </div>
          {nearest ? (
            <div className="flex items-center space-x-2">
              <span className="font-bold">D-{Math.ceil(nearest.diff)}</span>
              <span
                className="break-all"
                title={nearest.name}  // 전체 이름 툴팁
              >
                {displayDdayName}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">
              디데이를 설정해보세요!
            </span>
          )}
        </div>

        {/* 각오 카드 */}
        <div className={`rounded-lg p-4
          ${isDark? "bg-[#3B3E4B] text-white" : "bg-white text-black"}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">나의 각오</span>
            <button 
              className="text-xs text-blue-400 hover:underline"
              onClick={() => setResolutionModalOpen(true)}
            >
              설정
            </button>
          </div>
          <span className={displayResolution 
            ? "" 
            : "text-gray-500"}
            title={resolution}
          >
            {displayResolution || "각오를 다짐해보세요!"}
          </span>
        </div>
      </div>

      {/* 모달들 */}
      <GoalSettingsModal
        isOpen={isGoalModalOpen}
        goalHours={goalHours}
        goalMinutes={goalMinutes}
        onClose={() => setGoalModalOpen(false)}
        onSave={(newH, newM) => {
          // 서버에 목표 시간 저장 API 호출 예시 (필요 시 구현)
          onGoalChange(newH, newM);
          setGoalHours(newH);
          setGoalMinutes(newM);
        }}
      />

      <DdaySettingsModal
        isOpen={isDdayModalOpen}
        onClose={() => setDdayModalOpen(false)}
        dDays={dDays}
        setDDays={setDDays}
        onUpdated={fetchDDays}
      />

      <ResolutionSettingsModal
        isOpen={isResolutionModalOpen}
        resolution={resolution}
        onClose={() => setResolutionModalOpen(false)}
        onSave={onResolutionChange}
      />
    </div>
  );
}
