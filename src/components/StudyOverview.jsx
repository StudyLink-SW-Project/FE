import { useState, useEffect, useCallback } from "react";
import GoalSettingsModal from "./modals/GoalSettingsModal";
import DdaySettingsModal from "./modals/DdaySettingsModal";
import ResolutionSettingsModal from "./modals/ResolutionSettingsModal";
import GoalCalendar from "./GoalCalendar";
import { useGoal } from "../contexts/GoalContext";
import { useTheme } from "../contexts/ThemeContext";

export function StudyOverview({ resolution, onResolutionChange, onGoalChange }) {
  const API = import.meta.env.VITE_APP_SERVER;

  const { isDark } = useTheme();
  
  // 공부시간 상태 (분 단위)
  const [todayTime, setTodayTime] = useState(0);
  const [totalTime, setTotalTime] = useState(null);

  // 전역 목표 시간 가져오기/설정
  const { goalHours, goalMinutes, setGoalHours, setGoalMinutes } = useGoal();

  // 목표 진행률 계산
  const totalGoal = goalHours * 60 + goalMinutes;
  const progress = totalGoal > 0 ? Math.min((todayTime / totalGoal) * 100, 100) : 0;

  // 화면 표시용
  const displayHours = goalHours;
  const displayMinutes = goalMinutes;

  // 모달 상태
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isDdayModalOpen, setDdayModalOpen] = useState(false);
  const [isResolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const openGoalModal = () => setGoalModalOpen(true);
  const closeGoalModal = () => setGoalModalOpen(false);
  const openDdayModal = () => setDdayModalOpen(true);
  const closeDdayModal = () => setDdayModalOpen(false);
  const openResolutionModal = () => setResolutionModalOpen(true);
  const closeResolutionModal = () => setResolutionModalOpen(false);
  const closeCalendar = () => setCalendarOpen(false);

  // D-day 상태
  const [dDays, setDDays] = useState([]);

  // D-day 가져오는 함수 (useCallback 으로 묶어서 재사용)
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
  }, [API]);

  useEffect(() => {
    async function fetchResolution() {
      try {
        const res = await fetch(`${API}user/resolve`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("각오 조회 API 실패");
        const data = await res.json();
        // data.result.resolve 에 문자열이 담겨온다고 가정
        if (data.isSuccess && data.result && typeof data.result.resolve === "string") {
          onResolutionChange(data.result.resolve);
        } else {
          throw new Error("각오 데이터 형식 오류");
        }
      } catch (err) {
        console.error(err);
        // 실패 시 빈 문자열로 초기화
        onResolutionChange("");
      }
    }
    fetchResolution();
  }, [API, onResolutionChange]);

  // 각오 표시용 (최대 11자, 초과 시 "..." 추가)
 const displayResolution = resolution
    ? (resolution.length > 13
         ? resolution.slice(0, 13) + "..."
         : resolution)
     : "";

  return (
    <div className="mx-auto w-3/5 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex gap-4 items-stretch">
        <div className="flex flex-col gap-2 flex-1">
          {/* 오늘 공부 시간 */}
          <div className={`rounded p-3 ${isDark ? 'bg-[#3B3E4B] text-white border-[#616680]' : 'bg-white text-black border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">오늘 공부 시간</span>
                <span className="text-sm text-gray-00 font-medium opacity-50"> / 목표 공부 시간</span>
              </div>
              <button
                className="text-sm text-blue-400 hover:underline cursor-pointer"
                onClick={openGoalModal}
              >
                목표 설정
              </button>
            </div>
            <div className="mt-2 text-xl font-bold">
              {Math.floor(todayTime / 60)}시간 {todayTime % 60}분 / {displayHours}시간 {displayMinutes}분
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-400 rounded h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm text-blue-400 mt-1 block">{Math.floor(progress)}% 달성</span>
          </div>

          {/* D-day & 각오 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className={`rounded p-3 ${isDark ? 'bg-[#3B3E4B] text-white border-[#616680]' : 'bg-white text-black border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">내 D-Day</span>
                <button
                  className="text-sm text-blue-400 hover:underline cursor-pointer"
                  onClick={openDdayModal}
                >
                  설정
                </button>
              </div>
              {nearest ? (
                <div className="flex items-center mt-2">
                  <span className="text-xl font-bold mr-1">D-{Math.ceil(nearest.diff)}</span>
                  <span className="inline-block mx-2 w-px h-5 bg-gray-300 dark:bg-gray-600" />
                  <span className="text-xl font-bold ml-1">{nearest.name}</span>
                </div>
              ) : (
                <span className="mt-1 text-xl font-bold block">---</span>
              )}
            </div>

            {/* 내 각오 Card */}
            <div className={`rounded p-3 ${isDark ? 'bg-[#3B3E4B] text-white border-[#616680]' : 'bg-white text-black border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">내 각오</span>
                <button
                  className="text-sm text-blue-400 hover:underline cursor-pointer"
                  onClick={() => setResolutionModalOpen(true)}
                >
                  설정
                </button>
              </div>
              <span className="mt-2 text-sm font-bold block break-all">
                {displayResolution  || "---"}
              </span>
            </div>
          </div>
        </div>

        {/* 총 공부 시간 */}
        <div className={`w-1/3 -ml-2 ${isDark ? 'bg-[#3B3E4B] text-white border-[#616680]' : 'bg-white text-black border-gray-200'} rounded p-3 flex flex-col items-start`}>
          <span className="text-sm font-medium">총 공부 시간</span>
          {totalTime !== null ? (
            <div className="mt-2 text-xl font-bold">
              {Math.floor(totalTime / 60)}시간 {totalTime % 60}분
            </div>
          ) : (
            <div className="mt-2 text-lg text-gray-400">로딩 중…</div>
          )}
        </div>
      </div>

      {/* 모달들 */}
      <GoalSettingsModal
        isOpen={isGoalModalOpen}
        goalHours={goalHours}
        goalMinutes={goalMinutes}
        onClose={closeGoalModal}
        onSave={(newH, newM) => {
          setGoalHours(newH);
          setGoalMinutes(newM);
          onGoalChange(newH, newM);
        }}
      />
      <DdaySettingsModal
        isOpen={isDdayModalOpen}
        onClose={closeDdayModal}
        dDays={dDays}
        setDDays={setDDays}
        onUpdated={async () => {
          await fetchDDays();
        }}
      />
      <ResolutionSettingsModal
        isOpen={isResolutionModalOpen}
        resolution={resolution}
        onClose={closeResolutionModal}
        onSave={onResolutionChange}
      />

      {/* 캘린더 팝업 */}
      {isCalendarOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#3B3E4B] rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <button
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={closeCalendar}
              >
                ✕
              </button>
            </div>
            <GoalCalendar achievedDates={achievedDates} />
          </div>
        </div>
      )}
    </div>
  );
}
