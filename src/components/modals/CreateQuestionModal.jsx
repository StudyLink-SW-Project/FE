// src/components/CreateQuestionModal.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function CreateQuestionModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const user = useSelector(state => state.auth.user);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setExcerpt("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && excerpt.trim()) {
      onCreate({
        title,
        excerpt,
        author: user?.userName || ""   // 로그인된 사용자의 이름을 author로 전달
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#1D1F2C] rounded-xl w-1/2 max-w-2xl p-10 text-white relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-4">질문 작성</h2>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-auto space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="질문 제목을 입력하세요"
              className="w-full bg-[#2A2D3F] border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-gray-600 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">내용</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="질문의 요약 또는 내용을 입력하세요"
              className="w-full bg-[#2A2D3F] border border-gray-600 rounded px-3 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-gray-600 outline-none"
              rows={20}
              required
            />
          </div>

          <button
            type="submit"
            className="
              cursor-pointer
              block
              w-1/3
              mx-auto
              bg-gray-700 text-white
              py-2
              rounded
              hover:bg-gray-600
              transition
              mt-3
            "
          >
            질문 등록
          </button>
        </form>
      </div>
    </div>
  );
}
