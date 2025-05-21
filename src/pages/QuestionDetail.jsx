// src/pages/QuestionDetail.jsx
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, FileText, MessageCircle, ThumbsUp, User } from "lucide-react";
import { useState, useEffect } from "react";              // ← useEffect는 react에서!
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function QuestionDetail() {
  const { state } = useLocation();
  if (!state) return <Link to="/questions">목록으로 돌아가기</Link>;

  const { title: initTitle,
          excerpt: initExcerpt,
          author: initAuthor,
          dateTime: initDateTime,
          answers,
          likes,
          id } = state;

  // 상세 조회 결과 저장용
  const [postDetail, setPostDetail] = useState(null);

  // API 베이스 URL (DEV: 현재 도메인, PROD: 환경변수)
  const API = import.meta.env.DEV ? "/" : import.meta.env.VITE_APP_SERVER;

  // 댓글 상태
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const user = useSelector((state) => state.auth.user);
  const [likedComments, setLikedComments] = useState([]);

  // 질문 좋아요 토글 상태
  const [qLiked, setQLiked] = useState(false);
  const [qLikes, setQLikes] = useState(likes || 0);

  // 질문 좋아요 클릭 핸들러
  const handleQuestionLike = () => {
    setQLikes(qLiked ? qLikes - 1 : qLikes + 1);
    setQLiked(!qLiked);
  };
  // 컴포넌트 마운트 시, 백엔드에서 댓글 목록 불러오기
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`${API}post/${id}`, {
          credentials: "include",
        });
        const json = await resp.json();
        if (!json.isSuccess) {
          throw new Error(json.message || "상세 조회에 실패했습니다.");
        }
        const detail = json.result;
        // 상세 정보 저장
        setPostDetail(detail);
        setComments(
          detail.comments.map((c) => ({
            id: c.id,
            author: c.userName,
            text: c.comment,
            likes: 0,
            dateTime: c.createDate,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error(err.message);
      }
    })();
  }, [API, id]);

  // 보여줄 제목/내용/작성자/시간 결정
  const titleToShow      = postDetail?.title      || initTitle;
  const excerptToShow    = postDetail?.content    || initExcerpt;
  const authorToShow     = postDetail?.userName   || initAuthor;
  const dateTimeToShow   = postDetail?.createDate || initDateTime;

  // 좋아요 토글
  const handleLike = (commentId) => {
    const isLiked = likedComments.includes(commentId);
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likes: c.likes + (isLiked ? -1 : 1) }
          : c
      )
    );
    setLikedComments((prev) =>
      isLiked ? prev.filter((i) => i !== commentId) : [...prev, commentId]
    );
  };

  // 댓글 등록
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text) return;

    try {
      const resp = await fetch(`${API}comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          comment: text,
          postId: id,
          parentCommentId: null,
        }),
      });
      const json = await resp.json();
      if (!json.isSuccess) {
        throw new Error(json.message || "댓글 작성에 실패했습니다.");
      }
      toast.success("댓글이 등록되었습니다.");
      setComments((prev) => [
        ...prev,
        {
          id: Date.now(),          
          author: user?.userName || "익명",
          text,
          likes: 0,
          dateTime: new Date().toISOString(),
        },
      ]);
      setNewComment("");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
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
            <FileText className="w-6 h-6 mt-0.5 text-gray-300" />
            <h1 className="text-2xl font-semibold">{titleToShow}</h1>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap break-words">{excerptToShow}</p>
        </div>
        <div className="flex justify-between items-center text-gray-400 text-sm mt-8">
          <div className="flex items-center gap-4">
            <User className="w-4 h-4 -mr-2 text-gray-400" />
            <span className="font-medium text-white mr-5">{authorToShow}</span>
            <span className="text-sm">
              {new Date(dateTimeToShow).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-gray-400" />  
              {comments.length}
            </span>
            <button
              onClick={handleQuestionLike}
              className={`flex cursor-pointer items-center gap-1 text-sm ${
               qLiked
                ? "text-blue-400"
                : "text-gray-400 hover:text-white"
              }`}
            >
              <ThumbsUp className="cursor-pointer w-4 h-4" /> {qLikes}
            </button>
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
            <p className="text-white mb-6">{c.text}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-sm">
                <User className="w-4 h-4 -mr-2 text-gray-400" />
                <span className="font-medium text-white mr-5">{c.author}</span>
                <span className="text-gray-400 text-sm">
                  {new Date(c.dateTime).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => handleLike(c.id)}
                className={`flex cursor-pointer items-center gap-1 text-sm ${
                  likedComments.includes(c.id)
                    ? "text-blue-400"
                    : "text-gray-400 hover:text-white"
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
          className="cursor-pointer -ml-2 px-6 bg-blue-600 rounded-r hover:bg-blue-500 transition"
        >
          등록
        </button>
      </form>
    </div>
  );
}
