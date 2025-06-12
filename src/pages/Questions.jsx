// src/pages/Questions.jsx - 테마 적용
import { useState, useEffect } from "react";
import Header from "../components/Header";
import QuestionCard from "../components/cards/QuestionCard";
import CreateQuestionModal from "../components/modals/CreateQuestionModal";
import Pagination from "../components/Pagination";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useTheme } from "../contexts/ThemeContext";

export default function Questions() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { isDark } = useTheme(); 

  // API 베이스 URL (DEV: 현재 도메인, PROD: 환경변수)
  const API = import.meta.env.VITE_APP_SERVER;

  // 페이징 및 질문 목록 상태
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 1부터 시작
  const [totalPages, setTotalPages] = useState(1);

  // ★ 삭제 모달 상태 추가
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // 현재 로그인한 사용자 정보
  const user = useSelector(state => state.auth.user);

  // 페이지 조회 함수
  async function loadPage(page) {
    try {
      const resp = await fetch(`${API}post/list?page=${page}`, {
        credentials: "include",
      });
      const json = await resp.json();
      if (!json.isSuccess) {
        throw new Error(json.message || "게시글 목록 조회에 실패했습니다.");
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
      console.error(err);
      toast.error(err.message);
    }
  }

  // 페이지가 바뀔 때마다, 그리고 최초 마운트 시 목록 조회
  useEffect(() => {
    loadPage(currentPage - 1);
  }, [currentPage]);

  // 새 질문 생성
  const handleCreateQuestion = async (newQ) => {
    try {
      const resp = await fetch(`${API}post/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title:   newQ.title,
          content: newQ.excerpt,
          author:  newQ.author,
        }),
      });
      const apiRes = await resp.json();
      if (!apiRes.isSuccess || !apiRes.result?.isSuccess) {
        throw new Error(apiRes.message || "게시글 작성에 실패했습니다.");
      }
      toast.success("게시글이 성공적으로 등록되었습니다.");
      setShowModal(false);
      // 작성 후 현재 페이지가 1이면 직접 다시 조회,
      // 아니면 페이지를 1로 변경해서 useEffect가 호출되도록
      if (currentPage === 1) {
        loadPage(0);
      } else {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  // (2) 게시글 좋아요 토글 핸들러
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

  // ★ 게시글 삭제 핸들러 추가
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
      loadPage(currentPage - 1);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  // ★ 삭제 확인 모달 열기
  const openDeleteModal = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  // ★ 삭제 확인 모달 닫기
  const closeDeleteModal = () => {
    setQuestionToDelete(null);
    setShowDeleteModal(false);
  };

  // ★ 삭제 실행
  const confirmDeleteQuestion = async () => {
    if (questionToDelete) {
      await handleDeleteQuestion(questionToDelete.id);
      closeDeleteModal();
    }
  };

  // ★ 작성자 확인 함수
  const isQuestionAuthor = (questionAuthor) => {
    return user && user.userName === questionAuthor;
  };

  // 검색 필터링 (클라이언트 사이드)
  const filtered = questions.filter((q) =>
    q.title.includes(search)
  );

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-[#282A36] text-white' : 'bg-[#EFF1FE] text-gray-900'}`}>
      <Header />

      <div className="flex-1 p-8 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7 gap-4">
          <h1 className="text-4xl font-bold flex items-center">
            질문 게시판
          </h1>
          <div className="flex items-center w-full md:w-56 space-x-3 -mr-1">
            <PlusCircle
              className={`w-16 h-16 cursor-pointer ${isDark ? 'text-blue-400 hover:text-blue-600' : 'text-blue-500 hover:text-blue-700'}`}
              onClick={() => setShowModal(true)}
            />
            <input
              type="text"
              placeholder="검색"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className={`flex-1 pl-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-white text-black placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((q) => (
            <div key={q.id} className="relative">
              <QuestionCard {...q} onToggleLike={() => handleQuestionLike(q.id)}/>
              {/* ★ 삭제 버튼 (작성자만 보임, 항상 표시) */}
              {isQuestionAuthor(q.author) && (
                <button
                  onClick={(e) => {
                    e.preventDefault(); // QuestionCard의 Link 이벤트 방지
                    e.stopPropagation();
                    openDeleteModal(q);
                  }}
                  className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10' : 'text-red-500 hover:text-red-400 hover:bg-red-50'}`}
                  title="게시글 삭제"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <CreateQuestionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateQuestion}
      />

      {/* ★ 게시글 삭제 확인 모달 */}
      {showDeleteModal && questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs p-4">
          <div className={`rounded-xl p-6 max-w-md w-full mx-4 ${isDark ? 'bg-[#1D1F2C]' : 'bg-white'}`}>
            <div className="text-center">
              <Trash2 className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>게시글 삭제</h3>
              <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>해당 게시글을 삭제하시겠습니까?</p>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>삭제된 게시글과 모든 댓글은 복구할 수 없습니다.</p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDeleteQuestion}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition cursor-pointer"
                >
                  삭제
                </button>
                <button
                  onClick={closeDeleteModal}
                  className={`flex-1 py-2 rounded transition cursor-pointer ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'}`}
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