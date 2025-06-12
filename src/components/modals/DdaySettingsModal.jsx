// src/components/DdaySettingsModal.jsx
import { useState, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";

export default function DdaySettingsModal({ isOpen, onClose, dDays, setDDays }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // 모달 오픈 시 만료된 D-day 자동 삭제 및 정렬
  useEffect(() => {
    if (!isOpen) return;
    const today = new Date();
    const filtered = dDays
      .filter(d => (new Date(d.date) - today) / (1000 * 60 * 60 * 24) >= 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    setDDays(filtered);
  }, [isOpen]);

  // 항목 삭제
  const handleDelete = (idx) => {
    const updated = dDays.filter((_, i) => i !== idx);
    setDDays(updated);
  };

  // 항목 수정 모드 진입
  const handleEdit = (idx) => {
    setEditIndex(idx);
    setName(dDays[idx].name);
    setDate(dDays[idx].date);
  };

  // 추가 또는 수정 저장
  const handleSave = () => {
    if (!name || !date) return;
    const today = new Date();
    let updated;
    if (editIndex !== null) {
      updated = [...dDays];
      updated[editIndex] = { name, date };
    } else {
      updated = [...dDays, { name, date }];
    }
    const filtered = updated
      .filter(d => (new Date(d.date) - today) / (1000 * 60 * 60 * 24) >= 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setDDays(filtered);
    setName("");
    setDate("");
    setEditIndex(null);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">D-Day 설정</h3>
        <ul className="mb-4 space-y-2 max-h-60 overflow-auto">
          {dDays.map((d, idx) => (
            <li
              key={idx}
              className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded"
            >
              {/* 왼쪽: 이름만 flex-1 처리 */}
              <span className="flex-1 font-medium">{d.name}</span>

              {/* 날짜: 바로 아이콘 버튼 컨테이너 왼쪽으로 이동 */}
              <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
                {d.date}
              </span>

              {/* 오른쪽: 액션 아이콘 */}
              <div className="flex items-center space-x-2">
                <button onClick={() => handleEdit(idx)} aria-label="수정">
                  <Edit2 className="w-5 h-5 text-green-600 hover:text-green-400 cursor-pointer" />
                </button>
                <button onClick={() => handleDelete(idx)} aria-label="삭제">
                  <Trash2 className="w-5 h-5 text-red-600 hover:text-red-400 cursor-pointer" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="이름"
            className="flex-1 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            type="date"
            className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded cursor-pointer"
            onClick={() => {
              if (editIndex !== null) {
                // 수정 취소: 모달 닫지 않고 입력 초기화
                setEditIndex(null);
                setName("");
                setDate("");
              } else {
                onClose();
              }
            }}
          >
            {editIndex !== null ? '수정 취소' : '닫기'}
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
            onClick={handleSave}
          >
            {editIndex !== null ? '수정 저장' : '추가'}
          </button>
        </div>
      </div>
    </div>
  );
}
