// src/components/CreateQuestionModal.jsx
import { useEffect, useState } from "react";

export default function CreateQuestionModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");

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
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black bg-opacity-70 dark:bg-white dark:bg-opacity-30
      "
    >
      <div
        className="
          bg-background text-foreground
          rounded-xl w-1/2 max-w-2xl p-10
          relative flex flex-col
        "
      >
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4
            text-foreground/60 hover:text-foreground
            transition
          "
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-4">질문 작성</h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-auto space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/70">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="질문 제목을 입력하세요"
              className="
                w-full
                bg-foreground/10 dark:bg-foreground/20
                border border-foreground/50
                rounded px-3 py-2
                text-foreground placeholder-foreground/50
                focus:ring-2 focus:ring-primary
                outline-none
                transition
              "
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/70">
              내용
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="질문의 요약 또는 내용을 입력하세요"
              className="
                w-full
                bg-foreground/10 dark:bg-foreground/20
                border border-foreground/50
                rounded px-3 py-3
                text-foreground placeholder-foreground/50
                focus:ring-2 focus:ring-primary
                outline-none
                transition
              "
              rows={20}
              required
            />
          </div>

          <button
            type="submit"
            className="
              block w-1/3 mx-auto
              bg-primary text-white
              py-2 rounded
              hover:bg-primary/80
              transition mt-3
            "
          >
            질문 등록
          </button>
        </form>
      </div>
    </div>
  );
}
