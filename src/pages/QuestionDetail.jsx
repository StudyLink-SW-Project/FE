// src/pages/QuestionDetail.jsx
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, ThumbsUp, User } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function QuestionDetail() {
  const { state } = useLocation();
  if (!state) return <Link to="/questions">목록으로 돌아가기</Link>;

  const { title, excerpt, author, date, dateTime, answers, views } = state;

  // 기존 댓글 및 새 댓글 입력값 상태
  const [comments, setComments] = useState([
    
  ]);
  const [newComment, setNewComment] = useState("");

  const user = useSelector(state => state.auth.user);  // ✨ 로그인 유저 정보 가져오기

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
      {
        id: prev.length + 1,
        author: user?.userName || "익명",             // ✨ userName 사용
        text,
        likes: 0,
        dateTime: new Date().toISOString(),           // ✨ ISO 형식 날짜/시간 기록
      },    ]);
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
      <div className="bg-[#1D1F2C] rounded-xl p-6 mb-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{excerpt}</p>
        </div>

        {/* 하단: 왼쪽 작성자&시간, 오른쪽 답변수&조회수 */}
        <div className="flex justify-between items-center text-gray-400 text-sm mt-8">
          {/* 왼쪽: 작성자 + 작성일시 */}
          <div className="flex items-center gap-4">
            <User className="w-4 h-4 -mr-2 text-gray-400" />
            <span className="font-medium text-white mr-5">{author}</span>
            <span className="text-sm">
              {new Date(dateTime).toLocaleString()}
            </span>
          </div>

          {/* 오른쪽: 답변수 + 조회수 */}
          <div className="flex items-center gap-4">
            <span>답변 {comments.length}개</span>
            <span>조회 {views}회</span>
          </div>
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
            className="bg-[#1D1F2C] rounded-xl p-4 flex flex-col justify-between"
          >
            {/* 댓글 본문 */}
            <p className="text-white mb-6">{c.text}</p>
            {/* 하단: 작성자 + 날짜·시간, 오른쪽 좋아요 */}
            <div className="flex justify-between items-center">
                {/* 왼쪽: 작성자 + 작성일시 */}
              <div className="flex items-center gap-4 text-sm">
                <User className="w-4 h-4 -mr-2 text-gray-400" />
                <span className="font-medium text-white mr-5">{c.author}</span>
                <span className="text-gray-400 text-sm">
                  {new Date(c.dateTime).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => handleLike(c.id)}
                className={`flex items-center gap-1 text-sm ${
                  likedComments.includes(c.id)
                    ? "text-blue-400"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <ThumbsUp className="cursor-pointer w-4 h-4" /> {c.likes}
              </button>
            </div>

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
          className="cursor-pointer px-6 bg-blue-600 rounded-r hover:bg-blue-500 transition"
        >
          등록
        </button>
      </form>
    </div>
  );
}
