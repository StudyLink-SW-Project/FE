// src/components/CreateQuestionModal.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-[#1D1F2C] rounded-xl w-full max-w-4xl max-h-[90vh] p-6 sm:p-8 md:p-10 text-white relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 pr-12">질문 작성</h2>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-col space-y-4 sm:space-y-6 flex-1 overflow-auto">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="질문 제목을 입력하세요"
                className="w-full bg-[#2A2D3F] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm sm:text-base"
                required
              />
            </div>
            
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium mb-2 text-gray-300">내용</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="질문의 요약 또는 내용을 입력하세요"
                className="flex-1 min-h-[200px] sm:min-h-[300px] w-full bg-[#2A2D3F] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-colors text-sm sm:text-base"
                required
              />
            </div>
          </div>

          <div className="flex justify-center pt-4 sm:pt-6 border-t border-gray-700 mt-4 sm:mt-6">
            <button
              type="submit"
              className="
                cursor-pointer
                w-full sm:w-auto
                px-8 sm:px-12 
                py-3
                bg-blue-600 hover:bg-blue-500 
                text-white font-medium
                rounded-lg
                transition-colors
                text-sm sm:text-base
              "
            >
              질문 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}