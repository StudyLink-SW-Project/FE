import { useState, useEffect } from "react";
import GoalSettingsModal from "./modals/GoalSettingsModal";
import DdaySettingsModal from "./modals/DdaySettingsModal";
import ResolutionSettingsModal from "./modals/ResolutionSettingsModal";

export function StudyOverview({ todayTime, goalHours, goalMinutes, resolution, onResolutionChange, onGoalChange }) {
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
    .map(({ name, date }) => ({ name, date, diff: (new Date(date) - new Date()) / (1000 * 60 * 60 * 24) }))
    .filter(item => item.diff >= 0)
    .sort((a, b) => a.diff - b.diff)[0];

  return (
    <div className="mx-auto w-3/5 px-4 sm:px-6 lg:px-8 py-4 rounded-b-lg">
      {/* 오늘 공부 섹션 */}
      <div className="mb-2 bg-white dark:bg-[#3B3E4B] border border-gray-200 dark:border-gray-600 rounded p-3">
        <div className="flex justify-between items-center">
          <div><span className="text-sm font-medium">오늘 공부 시간</span><span className="text-sm text-gray-00 font-medium opacity-50"> / 목표 공부 시간</span></div>
          <button className="text-sm text-blue-400 hover:underline cursor-pointer" onClick={openGoalModal}>목표 설정</button>
        </div>
        <div className="mt-2 text-xl font-bold">
          {Math.floor(todayTime / 60)}시간 {todayTime % 60}분 / {displayHours}시간 {displayMinutes}분
        </div>
        <div className="w-full bg-gray-300 dark:bg-gray-400 rounded h-2 mt-2">
          <div className="bg-blue-500 h-2 rounded" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm text-blue-400 mt-1 block">{Math.floor(progress)}% 달성</span>
      </div>

      {/* D-day 및 각오 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="relative bg-white dark:bg-[#3B3E4B] border border-gray-200 dark:border-gray-600 rounded p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">내 D-Day</span>
            <button className="text-sm text-blue-400 hover:underline cursor-pointer" onClick={openDdayModal}>설정</button>
          </div>
          {/* D-day와 이름 사이에 구분선 추가 */}
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
        <div className="relative bg-white dark:bg-[#3B3E4B] border border-gray-200 dark:border-gray-600 rounded p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">내 각오</span>
            <button className="text-sm text-blue-400 hover:underline cursor-pointer" onClick={openResolutionModal}>설정</button>
          </div>
          <span className="mt-2 text-lg font-bold block">{resolution || '---'}</span>
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
    </div>
  );
}
