// src/components/modals/ResolutionSettingsModal.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

export default function ResolutionSettingsModal({ isOpen, resolution, onSave, onClose }) {
  const [text, setText] = useState(resolution);
  const API = import.meta.env.VITE_APP_SERVER;

  const { isDark } = useTheme();

  useEffect(() => {
    if (isOpen) {
      // 열릴 때마다 서버에서 최신 각오를 가져옵니다.
      async function fetchResolution() {
        try {
          const res = await fetch(`${API}user/resolve`, {
            method: "GET",
            credentials: "include",
          });
          if (!res.ok) throw new Error("각오 조회 API 실패");
          const data = await res.json();
          if (data.isSuccess && data.result && typeof data.result.resolve === "string") {
            setText(data.result.resolve);
          } else {
            console.error("각오 데이터 형식 오류", data);
            setText(resolution);
          }
        } catch (err) {
          console.error(err);
          setText(resolution);
        }
      }
      fetchResolution();
    }
  }, [isOpen, resolution]);

  const handleSave = async () => {
    const payload = { resolve: text.slice(0, 30) };
    try {
      const res = await fetch(`${API}user/resolve`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("각오 저장 API 실패");
      const data = await res.json();
      if (data.isSuccess) {
        // 상위에도 변경사항 알림
        onSave(payload.resolve);
      } else {
        console.error("각오 저장 응답 오류:", data);
      }
    } catch (err) {
      console.error(err);
      // 실패 시에도 onSave 혹은 사용자 알림 로직 추가 가능
    } finally {
      onClose();
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-opacity-70 backdrop-brightness-20 z-999">
      <div className={` ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900 '} rounded-lg p-6 w-full max-w-sm`}>
        <h3 className="text-lg font-medium mb-4">내 각오 설정 (최대 30자)</h3>
        <textarea
          className="w-full h-24 rounded border border-gray-300 dark:border-gray-600 p-2 text-sm"
          maxLength={30}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="flex justify-end space-x-2 mt-4">
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded cursor-pointer" onClick={onClose}>취소</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
}
