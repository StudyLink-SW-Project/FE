import { useState, useEffect, useCallback } from "react";
import GoalSettingsModal from "./modals/GoalSettingsModal";
import DdaySettingsModal from "./modals/DdaySettingsModal";
import ResolutionSettingsModal from "./modals/ResolutionSettingsModal";
import { useStudy } from "../contexts/StudyContext";
import { useTheme } from "../contexts/ThemeContext";

export function StudyOverview({ resolution, onResolutionChange, onGoalChange }) {
  const API = import.meta.env.VITE_APP_SERVER;
  const { isDark } = useTheme();
  
  // 공부시간 상태 (분 단위)
  const [todayTime, setTodayTime] = useState(0);
  const [totalTime, setTotalTime] = useState(null);

  // 전역 목표 시간 가져오기/설정
  const { goalHours, goalMinutes, setGoalHours, setGoalMinutes } = useStudy();

  // 목표 진행률 계산
  const totalGoal = goalHours * 60 + goalMinutes;
  const progress = totalGoal > 0 ? Math.min((todayTime / totalGoal) * 100, 100) : 0;

  // 모달 상태
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isDdayModalOpen, setDdayModalOpen] = useState(false);
  const [isResolutionModalOpen, setResolutionModalOpen] = useState(false);

  // D-day 상태
  const [dDays, setDDays] = useState([]);

  // D-day 가져오는 함수
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

  // 최초 마운트 시 한 번 불러오기
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

  // 기존 parseTime 대체
  const parseTime = (str) => {
    const hoursMatch = str.match(/(\d+)시간/);
    const minutesMatch = str.match(/(\d+)분/);
    const h = hoursMatch ? Number(hoursMatch[1]) : 0;
    const m = minutesMatch ? Number(minutesMatch[1]) : 0;
    return [h, m];
  };

  // 공부 시간 정보 API 호출 및 파싱
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
          const [tH, tM] = parseTime(todayStudyTime);
          const [toH, toM] = parseTime(totalStudyTime);
          const [gH, gM] = parseTime(goalStudyTime);

          setTodayTime(tH * 60 + tM);
          setTotalTime(toH * 60 + toM);
          setGoalHours(gH);
          setGoalMinutes(gM);
        } else {
          throw new Error("공부 시간 데이터 오류");
        }
      } catch (err) {
        console.error(err);
        setTodayTime(0);
        setTotalTime(0);
        setGoalHours(0);
        setGoalMinutes(0);
      }
    }
    fetchStudyTime();
  }, [API, setGoalHours, setGoalMinutes]);

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

  // 각오 표시용 (최대 문자 수 제한, 초과 시 "..." 추가)
  const displayResolution = resolution
    ? (resolution.length > 15
         ? resolution.slice(0, 15) + "..."
         : resolution)
     : "";

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
      {/* 첫 번째 행: 오늘 공부시간 + 총 공부시간 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
        
        {/* 오늘 공부 시간 카드 - 모바일에서 1칸, 데스크탑에서 2칸 */}
        <div className={`col-span-1 lg:col-span-2 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 ${isDark ? 'bg-[#3B3E4B] text-white border-[#616680]' : 'bg-white text-black border-gray-200'}`}>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-1 lg:gap-2 mb-2 lg:mb-3">
            <div className="flex-1">
              <span className="text-xs sm:text-sm font-medium block">오늘 / 목표 공부 시간</span>
            </div>
            <button
              className="text-xs sm:text-sm text-blue-400 hover:underline cursor-pointer self-start lg:self-center"
              onClick={() => setGoalModalOpen(true)}
            >
              목표 설정
            </button>
          </div>
          
          <div>
            <div className="text-sm sm:text-base lg:text-xl font-bold mb-1 lg:mb-2">
              {Math.floor(todayTime / 60)}시간 {todayTime % 60}분 / {goalHours}시간 {goalMinutes}분
            </div>
            
            {/* 진행률 바 */}
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-1.5 sm:h-2 lg:h-3">
              <div 
                className="bg-blue-500 h-1.5 sm:h-2 lg:h-3 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <span className="text-xs sm:text-sm text-blue-400 mt-1 block">
              {Math.floor(progress)}% 달성
            </span>
          </div>
        </div>

        {/* 총 공부 시간 카드 */}
        <div className={`col-span-1 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 ${isDark ? 'bg-[#3B3E4B] text-white border-[#616680]' : 'bg-white text-black border-gray-200'}`}>
          <span className="text-xs sm:text-sm font-medium block mb-1 sm:mb-2">총 공부 시간</span>
          {totalTime !== null ? (
            <div className="text-sm sm:text-base lg:text-xl font-bold">
              {Math.floor(totalTime / 60)}시간 {totalTime % 60}분
            </div>
          ) : (
            <div className="text-xs sm:text-sm lg:text-base text-gray-400">로딩 중…</div>
          )}
        </div>

      </div>

      {/* 두 번째 행: D-day + 각오 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        
        {/* D-day 카드 */}
        <div className={`col-span-1 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 ${isDark ? 'bg-[#3B3E4B] text-white border-[#616680]' : 'bg-white text-black border-gray-200'}`}>
          <div className="flex justify-between items-center mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium">D-Day</span>
            <button
              className="text-xs sm:text-sm text-blue-400 hover:underline cursor-pointer"
              onClick={() => setDdayModalOpen(true)}
            >
              설정
            </button>
          </div>
          {nearest ? (
            <div className="flex flex-col lg:flex-row lg:items-center gap-0.5 lg:gap-2">
              <span className="text-sm sm:text-base lg:text-lg font-bold">
                D-{Math.ceil(nearest.diff)}
              </span>
              <span className="hidden lg:inline-block w-px h-4 bg-gray-300 dark:bg-gray-600" />
              <span className="text-xs sm:text-sm lg:text-base font-medium break-all">
                {nearest.name.length > 6
                  ? `${nearest.name.slice(0, 6)}...`
                  : nearest.name}
              </span>
            </div>
          ) : (
                      <span className={`text-xs sm:text-sm font-medium block break-all ${
            displayResolution ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-gray-400' : 'text-gray-500')
          }`}>
            {displayResolution || "디데이를 설정해보세요!"}
          </span>
                    )}
        </div>

        {/* 각오 카드 */}
        <div className={`col-span-1 lg:col-span-2 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 ${isDark ? 'bg-[#3B3E4B] text-white border-[#616680]' : 'bg-white text-black border-gray-200'}`}>
          <div className="flex justify-between items-center mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium">나의 각오</span>
            <button
              className="text-xs sm:text-sm text-blue-400 hover:underline cursor-pointer"
              onClick={() => setResolutionModalOpen(true)}
            >
              설정
            </button>
          </div>
          <span className={`text-xs sm:text-sm font-medium block break-all ${
            displayResolution ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-gray-400' : 'text-gray-500')
          }`}>
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
          setGoalHours(newH);
          setGoalMinutes(newM);
          onGoalChange(newH, newM);
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