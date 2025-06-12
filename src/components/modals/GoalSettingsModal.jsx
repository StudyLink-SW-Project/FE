import { useState, useEffect } from "react";

export default function GoalSettingsModal({ isOpen, goalHours, goalMinutes, onSave, onClose }) {
  if (!isOpen) return null;

  const [hours, setHours] = useState(goalHours);
  const [minutes, setMinutes] = useState(goalMinutes);

  useEffect(() => {
    setHours(goalHours);
    setMinutes(goalMinutes);
  }, [goalHours, goalMinutes]);

  const handleSave = () => {
    onSave(hours, minutes);
    onClose();        // 저장 후 모달 닫기
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">목표 공부 시간 설정</h3>
        <div className="flex items-end space-x-2 mb-4">
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min="0"
              className="w-16 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              placeholder="시간"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">시간</span>
          </div>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min="0"
              max="59"
              className="w-16 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              placeholder="분"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">분</span>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-500 cursor-pointer"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
            onClick={handleSave}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
