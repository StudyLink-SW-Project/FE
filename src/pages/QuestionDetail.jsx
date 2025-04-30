// src/pages/QuestionDetail.jsx
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, ThumbsUp } from "lucide-react";
import { useState } from "react";

export default function QuestionDetail() {
  const { state } = useLocation();
  if (!state) return <Link to="/questions">목록으로 돌아가기</Link>;

  const { title, excerpt, author, date, answers, views, accepted } = state;

  // 기존 댓글 및 새 댓글 입력값 상태
  const [comments, setComments] = useState([
    { id: 1, author: "익명1", text: "좋은 질문이네요!", likes: 0 },
    { id: 2, author: "익명2", text: "저도 궁금합니다 😊", likes: 2 },
  ]);
  const [newComment, setNewComment] = useState("");

  // '좋아요' 토글 상태를 관리할 ID 목록
  const [likedComments, setLikedComments] = useState([]);

  // 댓글 좋아요 토글
  const handleLike = (commentId) => {
    const isLiked = likedComments.includes(commentId);

    // 1) 댓글 좋아요 수 증감
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likes: c.likes + (isLiked ? -1 : 1) }
          : c
      )
    );

    // 2) likedComments 배열 업데이트 (토글)
    setLikedComments((prev) =>
      isLiked ? prev.filter((id) => id !== commentId) : [...prev, commentId]
    );
  };

  // 댓글 등록
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text) return;
    setComments((prev) => [
      ...prev,
      { id: prev.length + 1, author: "익명", text, likes: 0 },
    ]);
    setNewComment("");
  };

  return (
    <div className="min-h-screen bg-[#282A36] text-white p-8">
      <Link
        to="/questions"
        className="flex items-center mb-6 text-gray-400 hover:text-gray-200"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> 목록으로 돌아가기
      </Link>

      {/* 질문 본문 */}
      <div className="bg-[#1D1F2C] rounded-xl p-6 mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              accepted
                ? "bg-blue-600 text-white"
                : "bg-transparent text-blue-400 border border-blue-400"
            }`}
          >
            {accepted ? "채택됨" : "채택안됨"}
          </span>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <p className="text-gray-300 whitespace-pre-wrap">{excerpt}</p>
        <div className="flex justify-between text-sm text-gray-400">
          <div>
            작성자: <span className="font-medium text-white">{author}</span>
          </div>
          <div>{date}</div>
        </div>
        <div className="flex justify-end gap-6 text-gray-400">
          <div>답변 {comments.length}개</div>
          <div>조회 {views}회</div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-2">
          댓글 ({comments.length})
        </h2>
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-[#1D1F2C] rounded-xl p-4 flex justify-between items-start"
          >
            <div>
              <div className="text-sm text-gray-400 mb-1">
                작성자: {c.author}
              </div>
              <p className="text-white">{c.text}</p>
            </div>
            <button
              onClick={() => handleLike(c.id)}
              className={`flex items-center gap-1 text-sm ${
                likedComments.includes(c.id)
                  ? "text-blue-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <ThumbsUp className="w-4 h-4" /> {c.likes}
            </button>
          </div>
        ))}
      </div>

      {/* 새 댓글 폼 */}
      <form onSubmit={handleCommentSubmit} className="mt-8 flex gap-2">
        <input
          type="text"
          placeholder="댓글을 입력하세요..."
          className="flex-1 px-4 py-2 rounded-l bg-[#1D1F2C] text-white outline-none"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          className="px-6 bg-blue-600 rounded-r hover:bg-blue-500 transition"
        >
          등록
        </button>
      </form>
    </div>
  );
}
