// src/components/modals/ResolutionSettingsModal.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

export default function ResolutionSettingsModal({ isOpen, resolution, onSave, onClose }) {
  const [text, setText] = useState(resolution);

  const { isDark } = useTheme();

  useEffect(() => {
    if (isOpen) setText(resolution);
  }, [isOpen, resolution]);

  const handleSave = () => {
    onSave(text.slice(0, 30));
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-opacity-70 backdrop-brightness-20">
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
