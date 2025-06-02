// src/pages/QuestionDetail.jsx
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, FileText, MessageCircle, ThumbsUp, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ChevronDown, ChevronUp } from "lucide-react";
import Header from "../components/Header";

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

  // 답글 달 댓글 ID
  const [replyTo, setReplyTo] = useState(null);
  // 답글 입력값
  const [replyText, setReplyText] = useState("");

  const user = useSelector((state) => state.auth.user);
  const [likedComments, setLikedComments] = useState([]);

  // 질문 좋아요 상태
  const [qLiked, setQLiked] = useState(false);
  const [qLikes, setQLikes] = useState(likes || 0);

  // ★ 답글 접기/펼치기 상태 관리
  const [collapsedReplies, setCollapsedReplies] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`${API}post/${id}`, { credentials: "include" });
        const json = await resp.json();
        if (!json.isSuccess) throw new Error(json.message || "상세 조회에 실패했습니다.");

        const detail = json.result;
        setPostDetail(detail);

        setQLikes(detail.likeCount);
        setQLiked(detail.liked);

        setComments(
          detail.comments.map((c) => ({
            id:          c.id,
            author:      c.userName,
            text:        c.comment,
            likes:       c.likeCount,
            liked:       c.liked,
            dateTime:    c.createDate,
            topParentId: c.topParentId,
          }))
        );

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

      setQLiked(json.result.liked);
      setQLikes(json.result.likeCount);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      const resp = await fetch(`${API}comment/${commentId}/like`, {
        method: "POST",
        credentials: "include",
      });
      const json = await resp.json();
      if (!json.isSuccess) throw new Error(json.message || "댓글 좋아요 토글에 실패했습니다.");

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
        body: JSON.stringify({ comment: text, postId: id, parentCommentId: null }),
      });
      const json = await resp.json();
      if (!json.isSuccess) throw new Error(json.message || "댓글 작성에 실패했습니다.");

      toast.success("댓글이 등록되었습니다.");
      setNewComment("");
      await reloadComments();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text) return;
    try {
      const resp = await fetch(`${API}comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: text, postId: id, parentCommentId: parentId }),
      });
      const json = await resp.json();
      if (!json.isSuccess) throw new Error(json.message || "답글 작성에 실패했습니다.");

      toast.success("답글이 등록되었습니다.");
      setReplyTo(null);
      setReplyText("");
      await reloadComments();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const reloadComments = async () => {
    const resp = await fetch(`${API}post/${id}`, { credentials: "include" });
    const json = await resp.json();
    if (!json.isSuccess) throw new Error(json.message);
    const detail = json.result;
    setComments(detail.comments.map(c => ({
      id:          c.id,
      author:      c.userName,
      text:        c.comment,
      likes:       c.likeCount,
      liked:       c.liked,
      dateTime:    c.createDate,
      topParentId: c.topParentId,
    })));
    setLikedComments(detail.comments.filter(c => c.liked).map(c => c.id));
  };

  const titleToShow    = postDetail?.title    || initTitle;
  const excerptToShow  = postDetail?.content  || initExcerpt;
  const authorToShow   = postDetail?.userName || initAuthor;
  const dateTimeToShow = postDetail?.createDate || initDateTime;

  return (
    <div className="min-h-screen bg-[#282A36] text-white p-8">
      <Header/>
      <Link to="/questions" className="flex items-center mb-6 text-gray-400 hover:text-gray-200">
        <ArrowLeft className="w-5 h-5 mr-2" /> 목록으로 돌아가기
      </Link>

      <div className="bg-[#1D1F2C] rounded-xl p-6 mb-2 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
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

      <form onSubmit={handleCommentSubmit} className="mb-5 flex gap-2">
        <input
          type="text"
          placeholder="댓글을 입력하세요..."
          className="flex-1 px-4 py-2 rounded-l bg-[#1D1F2C] text-white outline-none"
          value={newComment} onChange={e => setNewComment(e.target.value)}
        />
        <button type="submit" className="cursor-pointer -ml-2 px-6 bg-blue-600 rounded-r hover:bg-blue-500 transition">
          등록
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          댓글 ({comments.filter(c => c.topParentId == null).length})
        </h2>

        {comments
          .filter(c => c.topParentId == null)
          .map(parent => {
            return (
              <div key={parent.id} className="space-y-4">
                {/* — 부모 댓글 카드 */}
                <div className="bg-[#1D1F2C] rounded-xl p-4 flex flex-col justify-between">
                  <p className="text-white mb-6">{parent.text}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm">
                      <User className="w-4 h-4 -mr-2 text-gray-400" />
                      <span className="font-medium text-white mr-3">{parent.author}</span>
                      <span className="text-gray-400 text-sm">
                        {new Date(parent.dateTime).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCommentLike(parent.id)}
                      className={`flex cursor-pointer items-center gap-1 text-sm ${
                        likedComments.includes(parent.id)
                          ? "text-blue-400"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" /> {parent.likes}
                    </button>
                  </div>

                  {/* 답글 토글 버튼 */}
                  <div className="mt-2 flex gap-1">
                    <button
                      className="text-blue-400 text-xs hover:underline cursor-pointer"
                      onClick={() => setReplyTo(prev => prev === parent.id)}
                    >
                      답글
                    </button>
                    
                    {/* 답글 접기/펼치기 버튼 (답글 개수 + 화살표) */}
                    {comments.filter(c => c.topParentId === parent.id).length > 0 && (
                      <button
                        className="self-start text-blue-400 text-xs flex items-center gap-0.5 hover:underline cursor-pointer"
                        onClick={() => setCollapsedReplies(prev => ({
                          ...prev,
                          [parent.id]: !prev[parent.id]
                        }))}
                      >
                        {comments.filter(c => c.topParentId === parent.id).length}개
                        <span className="mt-0.5">
                          {collapsedReplies[parent.id]
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />
                        }
                        </span>
                      </button>
                    )}
                  </div>

                  {/* 답글 입력창 */}
                  {replyTo === parent.id && (
                    <form onSubmit={e => handleReplySubmit(e, parent.id)} className="mt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="답글을 입력하세요..."
                        className="flex-1 px-3 py-1 rounded-l bg-[#2A2D3F] text-white outline-none text-sm"
                        value={replyText} onChange={e => setReplyText(e.target.value)}
                      />
                      <button type="submit" className="px-3 py-1 -ml-2 bg-blue-600 rounded-r text-xs hover:bg-blue-500 cursor-pointer">
                        등록
                      </button>
                    </form>
                  )}
                </div>

                {/* — 분리된 답글 컨테이너 (접혀있으면 숨김) */}
                {!collapsedReplies[parent.id] && (
                  <div className="ml-12 -mt-2 space-y-2">
                    {comments
                      .filter(c => c.topParentId === parent.id)
                      .map(reply => (
                        <div
                          key={reply.id}
                          className="bg-[#1D1F2C] rounded-xl rounded-tl-none p-4 flex flex-col justify-between"
                        >
                          <p className="text-white mb-6">{reply.text}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 text-sm">
                              <User className="w-4 h-4 -mr-2 text-gray-400" />
                              <span className="font-medium text-white mr-3">{reply.author}</span>
                              <span className="text-gray-400 text-sm">
                                {new Date(reply.dateTime).toLocaleString()}
                              </span>
                            </div>
                            <button
                              onClick={() => handleCommentLike(reply.id)}
                              className={`flex cursor-pointer items-center gap-1 text-sm ${
                                likedComments.includes(reply.id)
                                  ? "text-blue-400"
                                  : "text-gray-400 hover:text-white"
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" /> {reply.likes}
                            </button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}