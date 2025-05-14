// src/pages/QuestionDetail.jsx
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, ThumbsUp } from "lucide-react";
import { useState } from "react";

export default function QuestionDetail() {
  const { state } = useLocation();
  if (!state) return <Link to="/questions">목록으로 돌아가기</Link>;

  const { title, excerpt, author, date, views, accepted } = state;

  const [comments, setComments] = useState([
    { id: 1, author: "익명1", text: "좋은 질문이네요!", likes: 0 },
    { id: 2, author: "익명2", text: "저도 궁금합니다 😊", likes: 2 },
  ]);
  const [newComment, setNewComment] = useState("");
  const [likedComments, setLikedComments] = useState([]);

  const handleLike = (commentId) => {
    const isLiked = likedComments.includes(commentId);
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, likes: c.likes + (isLiked ? -1 : 1) } : c
      )
    );
    setLikedComments((prev) =>
      isLiked ? prev.filter((id) => id !== commentId) : [...prev, commentId]
    );
  };

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
    <div className="min-h-screen bg-background text-foreground p-8">
      <Link
        to="/questions"
        className="flex items-center mb-6 text-foreground/60 hover:text-foreground transition"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> 목록으로 돌아가기
      </Link>

      {/* 질문 본문 */}
      <div className="bg-foreground/10 dark:bg-foreground/20 rounded-xl p-6 mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              accepted
                ? "bg-primary text-white"
                : "bg-transparent text-primary border border-primary"
            }`}
          >
            {accepted ? "채택됨" : "채택안됨"}
          </span>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <p className="text-foreground/70 whitespace-pre-wrap">{excerpt}</p>
        <div className="flex justify-between text-sm text-foreground/60">
          <div>
            작성자: <span className="font-medium text-foreground">{author}</span>
          </div>
          <div>{date}</div>
        </div>
        <div className="flex justify-end gap-6 text-foreground/60">
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
            className="bg-foreground/10 dark:bg-foreground/20 rounded-xl p-4 flex justify-between items-start"
          >
            <div>
              <div className="text-sm text-foreground/60 mb-1">
                작성자: {c.author}
              </div>
              <p className="text-foreground">{c.text}</p>
            </div>
            <button
              onClick={() => handleLike(c.id)}
              className={`
                flex items-center gap-1 text-sm
                ${
                  likedComments.includes(c.id)
                    ? "text-primary"
                    : "text-foreground/60 hover:text-foreground"
                }
                transition
              `}
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
          className="
            flex-1 px-4 py-2 rounded-l
            bg-foreground/10 dark:bg-foreground/20
            text-foreground placeholder-foreground/50
            outline-none transition
          "
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          className="
            px-6
            bg-primary text-white
            rounded-r hover:bg-primary/80
            transition
          "
        >
          등록
        </button>
      </form>
    </div>
  );
}
