import { useState, useEffect } from "react";

export default function GoalSettingsModal({ isOpen, goalHours, goalMinutes, onClose, onSave }) {
  if (!isOpen) return null;

  const [hours, setHours] = useState(goalHours);
  const [minutes, setMinutes] = useState(goalMinutes);
  const [isSaving, setIsSaving] = useState(false);

  const API = import.meta.env.VITE_APP_SERVER;

  useEffect(() => {
    setHours(goalHours);
    setMinutes(goalMinutes);
  }, [goalHours, goalMinutes]);

  const handleSave = async () => {
    const totalMinutes = hours * 60 + minutes;
    if (isNaN(totalMinutes) || totalMinutes < 0) {
      alert("올바른 목표 시간을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch(`${API}study/goal/${totalMinutes}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("목표 설정 실패");

      onSave(hours, minutes);

      // 성공적으로 저장한 후 모달 닫기
      onClose();
    } catch (err) {
      console.error(err);
      alert("목표 설정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-opacity-70 backdrop-brightness-20 z-50">
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
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-500"
            onClick={onClose}
            disabled={isSaving}
          >
            취소
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
