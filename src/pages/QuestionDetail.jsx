// src/pages/QuestionDetail.jsx
import { useLocation, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, MessageCircle, ThumbsUp, User, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ChevronDown, ChevronUp } from "lucide-react";
import Header from "../components/Header";

export default function QuestionDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    title: initTitle,
    excerpt: initExcerpt,
    author: initAuthor,
    dateTime: initDateTime,
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

  // 삭제 확인 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // ★ 댓글 삭제 모달 상태 추가
  const [showCommentDeleteModal, setShowCommentDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

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

  if (!state) {
    return (
      <div className="min-h-screen bg-[#282A36] text-white p-4 sm:p-6 md:p-8">
        <Header/>
        <Link to="/questions" className="flex items-center mb-6 text-gray-400 hover:text-gray-200">
          <ArrowLeft className="w-5 h-5 mr-2" /> 목록으로 돌아가기
        </Link>
      </div>
    );
  }

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

  const handleDeletePost = async () => {
    try {
      const resp = await fetch(`${API}post/${id}/delete`, {
        method: "POST",
        credentials: "include",
      });
      const json = await resp.json();
      if (!json.isSuccess) throw new Error(json.message || "게시글 삭제에 실패했습니다.");

      toast.success("게시글이 삭제되었습니다.");
      navigate("/questions"); // 삭제 후 목록 페이지로 이동
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  // ★ 댓글 삭제 핸들러 추가
  const handleDeleteComment = async (commentId) => {
    try {
      const resp = await fetch(`${API}comment/${commentId}/delete`, {
        method: "POST",
        credentials: "include",
      });
      const json = await resp.json();
      if (!json.isSuccess) throw new Error(json.message || "댓글 삭제에 실패했습니다.");

      toast.success("댓글이 삭제되었습니다.");
      // 댓글 목록 새로고침
      await reloadComments();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  // ★ 댓글 삭제 확인 모달 열기
  const openCommentDeleteModal = (comment) => {
    setCommentToDelete(comment);
    setShowCommentDeleteModal(true);
  };

  // ★ 댓글 삭제 확인 모달 닫기
  const closeCommentDeleteModal = () => {
    setCommentToDelete(null);
    setShowCommentDeleteModal(false);
  };

  // ★ 댓글 삭제 실행
  const confirmDeleteComment = async () => {
    if (commentToDelete) {
      await handleDeleteComment(commentToDelete.id);
      closeCommentDeleteModal();
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

  // 현재 로그인한 사용자가 작성자인지 확인
  const isAuthor = user && user.userName === authorToShow;

  // ★ 댓글 작성자 확인 함수 추가
  const isCommentAuthor = (commentAuthor) => {
    return user && user.userName === commentAuthor;
  };

  return (
    <>
      <Header/>
      <div className="min-h-screen bg-[#282A36] text-white p-4 sm:p-6 md:p-8">
        <Link to="/questions" className="flex items-center mb-6 text-gray-400 hover:text-gray-200">
          <ArrowLeft className="w-5 h-5 mr-2" /> 목록으로 돌아가기
        </Link>

        <div className="bg-[#1D1F2C] rounded-xl p-4 md:p-6 mb-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-start gap-2 flex-1 pr-4">
                <FileText className="w-6 h-6 mt-0.5 text-blue-400 flex-shrink-0" />
                <h1 className="text-xl md:text-2xl font-semibold break-words">{titleToShow}</h1>
              </div>
              {/* ★ 게시글 삭제 버튼 (작성자만 보임) */}
              {isAuthor && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0"
                  title="게시글 삭제"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-gray-300 whitespace-pre-wrap break-words">{excerptToShow}</p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-gray-400 text-sm mt-6 md:mt-8 gap-4 md:gap-0">
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

        <form onSubmit={handleCommentSubmit} className="mb-5 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="댓글을 입력하세요..."
            className="flex-1 px-4 py-2 sm:rounded-l rounded bg-[#1D1F2C] text-white outline-none"
            value={newComment} onChange={e => setNewComment(e.target.value)}
          />
          <button type="submit" className="sm:-ml-2 px-6 py-2 bg-blue-600 sm:rounded-r rounded hover:bg-blue-500 transition cursor-pointer">
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
                    <div className="flex justify-between items-start mb-6">
                      <p className="text-white flex-1 pr-4 break-words">{parent.text}</p>
                      {/* ★ 댓글 삭제 버튼 (작성자만 보임, 글 오른쪽 끝에 배치) */}
                      {isCommentAuthor(parent.author) && (
                        <button
                          onClick={() => openCommentDeleteModal(parent)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors flex-shrink-0"
                          title="댓글 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
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
                        onClick={() => setReplyTo(prev => prev === parent.id ? parent.id : parent.id)}
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
                            ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                          }
                          </span>
                        </button>
                      )}
                    </div>

                    {/* 답글 입력창 */}
                    <form onSubmit={e => handleReplySubmit(e, parent.id)} className="mt-2 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="답글을 입력하세요..."
                        className="flex-1 px-3 py-1 sm:rounded-l rounded bg-[#2A2D3F] text-white outline-none text-xs sm:text-sm"
                        value={replyTo === parent.id ? replyText : ""}
                        onChange={e => {
                          if (replyTo !== parent.id) return;
                          setReplyText(e.target.value);
                        }}
                        onFocus={() => setReplyTo(parent.id)} // 입력 시작 시 해당 댓글에 연결
                      />
                      <button
                        type="submit"
                        className="sm:-ml-2 px-3 py-1 bg-blue-600 sm:rounded-r rounded text-xs hover:bg-blue-500 cursor-pointer"
                      >
                        등록
                      </button>
                    </form>
                  </div>

                  {/* — 분리된 답글 컨테이너 (접혀있으면 숨김) */}
                  {!collapsedReplies[parent.id] && (
                    <div className="ml-6 sm:ml-12 -mt-2 space-y-2">
                      {comments
                        .filter(c => c.topParentId === parent.id)
                        .map(reply => (
                          <div
                            key={reply.id}
                            className="bg-[#1D1F2C] rounded-xl rounded-tl-none p-4 flex flex-col justify-between"
                          >
                            <div className="flex justify-between items-start mb-6">
                              <p className="text-white flex-1 pr-4 break-words">{reply.text}</p>
                              {/* ★ 답글 삭제 버튼 (작성자만 보임, 글 오른쪽 끝에 배치) */}
                              {isCommentAuthor(reply.author) && (
                                <button
                                  onClick={() => openCommentDeleteModal(reply)}
                                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors flex-shrink-0"
                                  title="댓글 삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
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

        {/* 게시글 삭제 확인 모달 */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
            <div className="bg-[#1D1F2C] rounded-xl p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">게시글 삭제</h3>
                <p className="text-gray-400 mb-6">해당 게시글을 삭제하시겠습니까?</p>
                <p className="text-gray-500 text-sm mb-6">삭제된 게시글과 모든 댓글은 복구할 수 없습니다.</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      handleDeletePost();
                    }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded transition cursor-pointer"
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded transition cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ★ 댓글 삭제 확인 모달 */}
        {showCommentDeleteModal && commentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1D1F2C] rounded-xl p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">댓글 삭제</h3>
                <p className="text-gray-400 mb-4">해당 댓글을 삭제하시겠습니까?</p>
                <p className="text-gray-500 text-sm mb-6">삭제된 댓글은 복구할 수 없습니다.</p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDeleteComment}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded transition cursor-pointer"
                  >
                    삭제
                  </button>
                  <button
                    onClick={closeCommentDeleteModal}
                    className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 rounded transition cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}