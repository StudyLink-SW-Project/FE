// src/components/DdaySettingsModal.jsx
import { useState, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";

export default function DdaySettingsModal({ isOpen, onClose, dDays, setDDays }) {
  const API = import.meta.env.VITE_APP_SERVER;

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // 모달 열 때마다 서버에서 최신 D-day 목록을 불러와 로컬 상태에 세팅
  useEffect(() => {
    if (!isOpen) return;
    async function fetchDDays() {
      try {
        const res = await fetch(`${API}day/list`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("D-day 목록 API 실패");
        const data = await res.json();
        if (data.isSuccess && Array.isArray(data.result)) {
          // [{ id, name, day }] → [{ id, name, day }]
          const list = data.result.map(({ id, name, day }) => ({
            id,
            name,
            day,
          }));
          // 만료된 항목 제거 & 날짜순 정렬
          const today = new Date();
          const filtered = list
            .filter(d => new Date(d.day) >= today)
            .sort((a, b) => new Date(a.day) - new Date(b.day));
          setDDays(filtered);
        } else {
          throw new Error("D-day 데이터 형식 오류");
        }
      } catch (err) {
        console.error(err);
        setDDays([]); // 에러 시 빈 리스트
      }
    }
    fetchDDays();
  }, [isOpen, API, setDDays]);

  // 항목 삭제: DELETE /d-day/{id}
  const handleDelete = async (idx) => {
    const target = dDays[idx];
    try {
      const res = await fetch(`${API}day/${target.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("D-day 삭제 API 실패");
      // 성공 시 로컬에서도 제거
      setDDays(dDays.filter((_, i) => i !== idx));
    } catch (err) {
      console.error(err);
      // 실패해도 UI 반영
      setDDays(dDays.filter((_, i) => i !== idx));
    }
  };

  // 수정 모드 진입
  const handleEdit = (idx) => {
    setEditIndex(idx);
    setName(dDays[idx].name);
    setDate(dDays[idx].day);
  };

  // 추가 또는 수정 저장
  const handleSave = async () => {
    if (!name || !date) return;
    const today = new Date();

    try {
      let updatedList;

      if (editIndex !== null) {
        // 수정: PUT /d-day
        const target = dDays[editIndex];
        const res = await fetch(`${API}day/${target.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: target.id, name, day: date }),
        });
        if (!res.ok) throw new Error("D-day 수정 API 실패");

        updatedList = dDays.map((d, i) =>
          i === editIndex ? { ...d, name, day: date } : d
        );
      } else {
        // 추가: POST /d-day
        const res = await fetch(`${API}day`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, day: date }),
        });
        if (!res.ok) throw new Error("D-day 추가 API 실패");
        const data = await res.json();
        updatedList = [...dDays, { id: data.result.id, name, day: date }];
      }

      // 만료된 항목 제거 & 날짜순 정렬
      const filtered = updatedList
        .filter(d => new Date(d.day) >= today)
        .sort((a, b) => new Date(a.day) - new Date(b.day));

      setDDays(filtered);
      setName("");
      setDate("");
      setEditIndex(null);
    } catch (err) {
      console.error(err);
      // 에러 시에도 입력 초기화
      setName("");
      setDate("");
      setEditIndex(null);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-opacity-70 backdrop-brightness-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">D-Day 설정</h3>

        <ul className="mb-4 space-y-2 max-h-60 overflow-auto">
          {dDays.map((d, idx) => (
            <li key={d.id} className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
              <span className="flex-1 font-medium">{d.name}</span>
              <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">{d.day}</span>
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
