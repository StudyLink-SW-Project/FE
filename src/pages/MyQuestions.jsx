// src/pages/MyQuestions.jsx
import { useState, useEffect } from "react";
import Header from "../components/Header";
import QuestionCard from "../components/cards/QuestionCard";
import Pagination from "../components/Pagination";
import { FileText, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function MyQuestions() {
  const [search, setSearch] = useState("");
  
  // API 베이스 URL
  const API = import.meta.env.VITE_APP_SERVER;

  // 페이징 및 질문 목록 상태
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // 삭제 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // 현재 로그인한 사용자 정보
  const user = useSelector(state => state.auth.user);

  // 내 게시글 목록 조회 함수
  async function loadMyPosts(page) {
    setLoading(true);
    try {
      // ★ 페이지 파라미터를 정확히 전달 (page 대신 0부터 시작)
      const resp = await fetch(`${API}post/mypost?page=${page}`, {
        method: 'GET',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }
      
      const json = await resp.json();
      console.log('API 응답:', json); // 디버깅용
      
      if (!json.isSuccess) {
        throw new Error(json.message || "내 게시글 목록 조회에 실패했습니다.");
      }
      
      const { posts, totalPages: tp } = json.result;
      setQuestions(
        posts.map((p) => ({
          id:       p.id,
          accepted: p.isDone,
          title:    p.title,
          excerpt:  p.content,
          author:   p.userName,
          date:     p.createDate,
          dateTime: `${p.createDate}`,
          answers:  p.commentCount,
          likes:    p.likeCount,
          liked:    p.liked,
        }))
      );
      setTotalPages(tp);
    } catch (err) {
      console.error('API 에러:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 페이지가 바뀔 때마다 목록 조회
  useEffect(() => {
    // ★ 사용자가 로그인되어 있는지 확인
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    loadMyPosts(currentPage - 1);
  }, [currentPage, user]);

  // 게시글 좋아요 토글 핸들러
  const handleQuestionLike = async (postId) => {
    try {
      const resp = await fetch(`${API}post/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });
      const json = await resp.json();
      if (!json.isSuccess) {
        throw new Error(json.message || "좋아요 토글에 실패했습니다.");
      }
      const { liked, likeCount } = json.result;
      // 해당 항목만 업데이트
      setQuestions(prev =>
        prev.map(q =>
          q.id === postId ? { ...q, likes: likeCount, liked } : q
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  // 게시글 삭제 핸들러
  const handleDeleteQuestion = async (postId) => {
    try {
      const resp = await fetch(`${API}post/${postId}/delete`, {
        method: "POST",
        credentials: "include",
      });
      const json = await resp.json();
      if (!json.isSuccess) {
        throw new Error(json.message || "게시글 삭제에 실패했습니다.");
      }
      toast.success("게시글이 삭제되었습니다.");
      // 현재 페이지 새로고침
      loadMyPosts(currentPage - 1);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  // 삭제 확인 모달 열기
  const openDeleteModal = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  // 삭제 확인 모달 닫기
  const closeDeleteModal = () => {
    setQuestionToDelete(null);
    setShowDeleteModal(false);
  };

  // 삭제 실행
  const confirmDeleteQuestion = async () => {
    if (questionToDelete) {
      await handleDeleteQuestion(questionToDelete.id);
      closeDeleteModal();
    }
  };

  // 검색 필터링 (클라이언트 사이드)
  const filtered = questions.filter((q) =>
    q.title.includes(search)
  );

  return (
    <div className="h-screen bg-[#282A36] text-white flex flex-col">
      <Header />

      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            내가 작성한 질문
          </h1>
          <div className="flex items-center w-full md:w-64 space-x-3 mt-2.5">
            <input
              type="text"
              placeholder="제목으로 검색"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 pl-4 py-2 rounded-full bg-white text-black text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-lg text-gray-400">로딩 중...</div>
          </div>
        )}

        {/* 게시글이 없는 경우 */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <FileText className="w-16 h-16 sm:w-24 sm:h-24 text-gray-500 mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-400 mb-3 sm:mb-4 text-center">
              {search ? '검색 결과가 없습니다' : '작성한 질문이 없습니다'}
            </h2>
            <p className="text-gray-500 text-center text-sm sm:text-base px-4">
              {search 
                ? '다른 검색어로 시도해보세요'
                : '질문 게시판에서 새로운 질문을 작성해보세요'
              }
            </p>
          </div>
        )}

        {/* 게시글 목록 */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-400">
              총 {filtered.length}개의 질문
            </div>
            
            <div className="space-y-2">
              {filtered.map((q) => (
                <div key={q.id} className="relative">
                  <QuestionCard {...q} onToggleLike={() => handleQuestionLike(q.id)}/>
                  {/* 삭제 버튼 (내 게시글이므로 항상 표시) */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDeleteModal(q);
                    }}
                    className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                    title="게시글 삭제"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* 게시글 삭제 확인 모달 */}
      {showDeleteModal && questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-[#1D1F2C] rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">게시글 삭제</h3>
              <p className="text-gray-400 mb-4">해당 게시글을 삭제하시겠습니까?</p>
              <p className="text-gray-500 text-sm mb-6">삭제된 게시글과 모든 댓글은 복구할 수 없습니다.</p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDeleteQuestion}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded transition cursor-pointer"
                >
                  삭제
                </button>
                <button
                  onClick={closeDeleteModal}
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
  );
}