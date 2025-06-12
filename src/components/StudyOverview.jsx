import { useState, useEffect } from "react";
import GoalSettingsModal from "./modals/GoalSettingsModal";
import DdaySettingsModal from "./modals/DdaySettingsModal";
import ResolutionSettingsModal from "./modals/ResolutionSettingsModal";
import GoalCalendar from "./GoalCalendar";

export function StudyOverview({
  todayTime,
  goalHours,
  goalMinutes,
  resolution,
  onResolutionChange,
  onGoalChange,
}) {
  // 목표 진행률 계산
  const totalGoal = goalHours * 60 + goalMinutes;
  const progress = totalGoal > 0 ? Math.min((todayTime / totalGoal) * 100, 100) : 0;

  // NaN 방지용 디폴트
  const displayHours = isNaN(goalHours) ? 0 : goalHours;
  const displayMinutes = isNaN(goalMinutes) ? 0 : goalMinutes;

  // 모달 오픈 상태
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isDdayModalOpen, setDdayModalOpen] = useState(false);
  const [isResolutionModalOpen, setResolutionModalOpen] = useState(false);

  // D-day 목록 상태
  const [dDays, setDDays] = useState([]);

  // 누적 공부시간 상태 (분 단위)
  const [cumulativeTime, setCumulativeTime] = useState(null);

  // 모달 핸들러
  const openGoalModal = () => setGoalModalOpen(true);
  const closeGoalModal = () => setGoalModalOpen(false);
  const openDdayModal = () => setDdayModalOpen(true);
  const closeDdayModal = () => setDdayModalOpen(false);
  const openResolutionModal = () => setResolutionModalOpen(true);
  const closeResolutionModal = () => setResolutionModalOpen(false);

  // 로컬스토리지에서 dDays 불러오기
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("dDays") || "[]");
    setDDays(stored);
  }, []);

  // dDays 저장
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

  // 누적 공부시간 API 호출
  useEffect(() => {
    async function fetchCumulative() {
      try {
        const res = await fetch("/api/cumulative-study-time");
        if (!res.ok) throw new Error("API 호출 실패");
        const data = await res.json();
        setCumulativeTime(data.totalMinutes);
      } catch (err) {
        console.error(err);
        setCumulativeTime(0);
      }
    }
    fetchCumulative();
  }, []);

  // 캘린더 모달 오픈 상태
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const openCalendar = () => setCalendarOpen(true);
  const closeCalendar = () => setCalendarOpen(false);

  // 예시 달성일 (실제론 API나 로컬 데이터에서 받아오시면 됩니다)
  const achievedDates = ['2025-06-22', '2025-06-18'];

  return (
    <div className="mx-auto w-3/5 px-4 sm:px-6 lg:px-8 py-4">
      {/* 상단 전체: 왼쪽/오른쪽 */}
      <div className="flex gap-4 items-stretch">
        {/* 왼쪽 컬럼: 오늘 공부 + D-day·각오 */}
        <div className="flex flex-col gap-2 flex-1">
          {/* 오늘 공부 섹션 */}
          <div className="bg-white dark:bg-[#3B3E4B] border border-gray-200 dark:border-gray-600 rounded p-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">오늘 공부 시간</span>
                <span className="text-sm text-gray-00 font-medium opacity-50">
                  {" "}
                  / 목표 공부 시간
                </span>
              </div>
              <button
                className="text-sm text-blue-400 hover:underline cursor-pointer"
                onClick={openGoalModal}
              >
                목표 설정
              </button>
            </div>
            <div className="mt-2 text-xl font-bold">
              {Math.floor(todayTime / 60)}시간 {todayTime % 60}분 /{" "}
              {displayHours}시간 {displayMinutes}분
            </div>
            <div className="w-full bg-gray-300 dark:bg-gray-400 rounded h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-blue-400 mt-1 block">
              {Math.floor(progress)}% 달성
            </span>
          </div>

          {/* D-day, 각오 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* D-day */}
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
                  <span className="text-xl font-bold mr-1">
                    D-{Math.ceil(nearest.diff)}
                  </span>
                  <span className="inline-block mx-2 w-px h-5 bg-gray-300 dark:bg-gray-600" />
                  <span className="text-xl font-bold ml-1">
                    {nearest.name}
                  </span>
                </div>
              ) : (
                <span className="mt-1 text-xl font-bold block">---</span>
              )}
            </div>

            {/* 각오 */}
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
              <span className="mt-2 text-lg font-bold block break-all">
                {resolution || "---"}
              </span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 총 공부 시간 */}
        <div className="w-1/3 bg-white dark:bg-[#3B3E4B] border border-gray-200 dark:border-gray-600 rounded p-3 flex flex-col items-start">
          <span className="text-sm font-medium">총 공부 시간</span>
          {cumulativeTime !== null ? (
            <div className="mt-2 text-xl font-bold">
              {`${Math.floor(cumulativeTime / 60)}시간 ${cumulativeTime % 60}분`}
            </div>
          ) : (
            <div className="mt-2 text-lg text-gray-400">로딩 중…</div>
          )}
          {/* 달성 기록 보기 버튼 */}
          <button
            className="mt-4 px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500"
            onClick={openCalendar}
          >
            달성 기록 보기
          </button>
        </div>
      </div>

      {/* 모달 컴포넌트 */}
      <GoalSettingsModal
        isOpen={isGoalModalOpen}
        goalHours={displayHours}
        goalMinutes={displayMinutes}
        onClose={closeGoalModal}
        onSave={onGoalChange}
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
      {/* GoalCalendar 모달 */}
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
