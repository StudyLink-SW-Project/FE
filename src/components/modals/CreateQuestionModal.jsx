import { useEffect, useState } from "react";

export default function CreateQuestionModal({ isOpen, onClose, onCreate }) {

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");

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
      onCreate({ title, excerpt });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl w-1/2 max-w-2x1 max-h-[200vh] h-200 p-10 text-black relative overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-4">질문 작성</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="질문 제목을 입력하세요"
              className="w-full border border-gray-300 rounded px-3 py-2 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">내용</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="질문의 요약 또는 내용을 입력하세요"
              className="w-full border border-gray-300 rounded px-3 py-3 outline-none"
              rows={20}
              required
            />
          </div>

          <button
            type="submit"
            className="
              block
              w-1/4        /* 너비를 절반으로 */
              mx-auto      /* 가운데 정렬 */
              bg-purple-600 text-white
              py-2         /* 세로 패딩 반으로 */
              rounded
              hover:bg-purple-700
              transition
          ">
            질문 등록
          </button>
        </form>
      </div>
    </div>
  );
}
