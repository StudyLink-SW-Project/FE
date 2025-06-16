import { useState, useEffect } from "react";
import GoalSettingsModal from "./modals/GoalSettingsModal";
import DdaySettingsModal from "./modals/DdaySettingsModal";
import ResolutionSettingsModal from "./modals/ResolutionSettingsModal";
import GoalCalendar from "./GoalCalendar";

export function StudyOverview({ resolution, onResolutionChange, onGoalChange }) {
  const API = import.meta.env.VITE_APP_SERVER;

  // 공부시간 상태 (분 단위 및 목표 시/분)
  const [todayTime, setTodayTime] = useState(0);        // 오늘 공부 시간 (분)
  const [totalTime, setTotalTime] = useState(null);     // 총 공부 시간 (분)
  const [goalHours, setGoalHours] = useState(0);        // 목표 시간: 시간
  const [goalMinutes, setGoalMinutes] = useState(0);    // 목표 시간: 분

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
  const openCalendar = () => setCalendarOpen(true);
  const closeCalendar = () => setCalendarOpen(false);

  // D-day 상태
  const [dDays, setDDays] = useState([]);

  // D-day 로컬스토리지 연동
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("dDays") || "[]");
    setDDays(stored);
  }, []);
  useEffect(() => {
    localStorage.setItem("dDays", JSON.stringify(dDays));
  }, [dDays]);

  // 가장 가까운 D-day 계산
  const nearest = dDays
    .map(({ name, date }) => ({
      name,
      date,
      diff: (new Date(date) - new Date()) / (1000 * 60 * 60 * 24),
    }))
    .filter(item => item.diff >= 0)
    .sort((a, b) => a.diff - b.diff)[0];

  // "0시간0분" 형식 파싱 함수
  const parseTime = (str) => {
    const match = str.match(/(\d+)시간(\d+)분/);
    if (match) {
      return [Number(match[1]), Number(match[2])];
    }
    return [0, 0];
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

          // 문자열 파싱
          const [tH, tM] = parseTime(todayStudyTime);
          const [toH, toM] = parseTime(totalStudyTime);
          const [gH, gM] = parseTime(goalStudyTime);

          // 상태에 저장
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

  // 캘린더에 표시할 달성 날짜 예시
  const achievedDates = ["2025-06-22", "2025-06-18"];

  return (
    <div className="mx-auto w-3/5 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex gap-4 items-stretch">
        <div className="flex flex-col gap-2 flex-1">
          {/* 오늘 공부 시간 */}
          <div className="bg-white dark:bg-[#3B3E4B] border border-gray-200 dark:border-gray-600 rounded p-3">
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
            <div className="bg-white dark:bg-[#3B3E4B] border border-gray-200 dark:border-gray-600 rounded p-3">
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

            <div className="bg-white dark:bg-[#3B3E4B] border border-gray-200 dark:border-gray-600 rounded p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">내 각오</span>
                <button
                  className="text-sm text-blue-400 hover:underline cursor-pointer"
                  onClick={openResolutionModal}
                >
                  설정
                </button>
              </div>
              <span className="mt-2 text-lg font-bold block break-all">{resolution || "---"}</span>
            </div>
          </div>
        </div>

        {/* 총 공부 시간 */}
        <div className="w-1/3 -ml-2 bg-white dark:bg-[#3B3E4B] border border-gray-200 dark:border-gray-600 rounded p-3 flex flex-col items-start">
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
        goalHours={displayHours}
        goalMinutes={displayMinutes}
        onClose={closeGoalModal}
        onSave={(newHours, newMinutes) => {
          // 부모 상태 바로 업데이트
          setGoalHours(newHours);
          setGoalMinutes(newMinutes);
          // 필요하면 API로부터 재조회도 가능합니다.
          onGoalChange(newHours, newMinutes);
        }}
      />
      <DdaySettingsModal
        isOpen={isDdayModalOpen}
        onClose={closeDdayModal}
        dDays={dDays}
        setDDays={setDDays}
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
