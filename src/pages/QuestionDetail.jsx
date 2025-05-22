// src/pages/QuestionDetail.jsx
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, FileText, MessageCircle, ThumbsUp, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function QuestionDetail() {
  const { state } = useLocation();
  if (!state) return <Link to="/questions">목록으로 돌아가기</Link>;

  const {
    title: initTitle,
    excerpt: initExcerpt,
    author: initAuthor,
    dateTime: initDateTime,
    answers,
    likes,
    id
  } = state;

  const [postDetail, setPostDetail] = useState(null);
  const API = import.meta.env.DEV ? "/" : import.meta.env.VITE_APP_SERVER;

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const user = useSelector((state) => state.auth.user);
  const [likedComments, setLikedComments] = useState([]);

  // 이 둘은 이제 백엔드 토글 결과로 갱신합니다
  const [qLiked, setQLiked]   = useState(false);
  const [qLikes, setQLikes]   = useState(likes || 0);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`${API}post/${id}`, { credentials: "include" });
        const json = await resp.json();
        if (!json.isSuccess) throw new Error(json.message || "상세 조회에 실패했습니다.");

        const detail = json.result;
        setPostDetail(detail);

        // 백엔드에서 내려준 좋아요 카운트와 내가 눌렀는지 여부로 초기화
        setQLikes(detail.likeCount);
        setQLiked(detail.liked);

        setComments(
          detail.comments.map((c) => ({
            id:       c.id,
            author:   c.userName,
            text:     c.comment,
            likes:    c.likeCount,
            liked:    c.liked,
            dateTime: c.createDate,
          }))
        );

        // 초기 좋아요 눌린 댓글 ID 리스트 설정
        setLikedComments(
          detail.comments.filter((c) => c.liked).map((c) => c.id)
        );
      } catch (err) {
        console.error(err);
        toast.error(err.message);
      }
    })();
  }, [API, id]);

  const handleQuestionLike = async () => {
    try {
      const resp = await fetch(`${API}post/${id}/like`, {
        method: "POST",
        credentials: "include",
      });
      const json = await resp.json();
      if (!json.isSuccess) throw new Error(json.message || "좋아요 토글에 실패했습니다.");

      const { liked, likeCount } = json.result;
      setQLiked(liked);
      setQLikes(likeCount);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };


   // 댓글 좋아요 토글
   const handleCommentLike = async (commentId) => {
     try {
       const resp = await fetch(`${API}comment/${commentId}/like`, {
         method: "POST",
        credentials: "include",
       });
       const json = await resp.json();
       if (!json.isSuccess) {
         throw new Error(json.message || "댓글 좋아요 토글에 실패했습니다.");
       }
       const { liked, likeCount } = json.result;
       setComments((prev) =>
         prev.map((c) =>
           c.id === commentId ? { ...c, likes: likeCount, liked } : c
         )
       );
        setLikedComments((prev) =>
         liked
           ? Array.from(new Set([...prev, commentId]))
           : prev.filter((i) => i !== commentId)
       );
     } catch (err) {
       console.error(err);
       toast.error(err.message);
     }
   };

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
      if (!json.isSuccess) throw new Error(json.message || "댓글 작성에 실패했습니다.");

      toast.success("댓글이 등록되었습니다.");
      
      const detailResp = await fetch(`${API}post/${id}`, {
        credentials: "include",
      });
      const detailJson = await detailResp.json();
      if (!detailJson.isSuccess) throw new Error(detailJson.message || "상세 조회에 실패했습니다.");

      // 백엔드에서 내려준 댓글 목록으로 state 덮어쓰기
      const detail = detailJson.result;
      setComments(
        detail.comments.map((c) => ({
          id:       c.id,
          author:   c.userName,
          text:     c.comment,
          likes:    c.likeCount,
          liked:    c.liked,
          dateTime: c.createDate,
        }))
      );
      setLikedComments(detail.comments.filter(c => c.liked).map(c => c.id));
      setNewComment("");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const titleToShow    = postDetail?.title      || initTitle;
  const excerptToShow  = postDetail?.content    || initExcerpt;
  const authorToShow   = postDetail?.userName   || initAuthor;
  const dateTimeToShow = postDetail?.createDate || initDateTime;

  return (
    <div className="min-h-screen bg-[#282A36] text-white p-8">
      <Link to="/questions" className="flex items-center mb-6 text-gray-400 hover:text-gray-200">
        <ArrowLeft className="w-5 h-5 mr-2" /> 목록으로 돌아가기
      </Link>

      <div className="bg-[#1D1F2C] rounded-xl p-6 mb-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6 mt-0.5 text-purple-400" />
            <h1 className="text-2xl font-semibold">{titleToShow}</h1>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap break-words">{excerptToShow}</p>
        </div>
        <div className="flex justify-between items-center text-gray-400 text-sm mt-8">
          <div className="flex items-center gap-4">
            <User className="w-4 h-4 -mr-2 text-gray-400" />
            <span className="font-medium text-white mr-5">{authorToShow}</span>
            <span className="text-sm">{new Date(dateTimeToShow).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-gray-400" />
              {comments.length}
            </span>
            <button
              onClick={handleQuestionLike}
              className={`flex cursor-pointer items-center gap-1 text-sm ${
                qLiked ? "text-blue-400" : "text-gray-400 hover:text-white"
              }`}
            >
              <ThumbsUp className="cursor-pointer w-4 h-4" /> {qLikes}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-2">댓글 ({comments.length})</h2>
        {comments.map((c) => (
          <div key={c.id} className="bg-[#1D1F2C] rounded-xl p-4 flex flex-col justify-between">
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
                onClick={() => handleCommentLike(c.id)}
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
