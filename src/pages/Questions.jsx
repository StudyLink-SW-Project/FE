// src/pages/Questions.jsx
import { useState, useEffect } from "react";
import Header from "../components/Header";
import QuestionCard from "../components/cards/QuestionCard";
import CreateQuestionModal from "../components/modals/CreateQuestionModal";
import Pagination from "../components/Pagination";
import { PlusCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function Questions() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // API 베이스 URL (DEV: 현재 도메인, PROD: 환경변수)
  const API = import.meta.env.VITE_APP_SERVER;

  // 페이징 및 질문 목록 상태
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 1부터 시작
  const [totalPages, setTotalPages] = useState(1);

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
  // 검색 필터링 (클라이언트 사이드)
  const filtered = questions.filter((q) =>
    q.title.includes(search)
  );

  return (
    <div className="min-h-screen bg-[#282A36] text-white">
      <Header />

      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7 gap-4">
          <h1 className="text-4xl font-bold flex items-center">
            질문 게시판
          </h1>
          <div className="flex items-center w-full md:w-64 space-x-3 mt-2.5">
            <PlusCircle
              className="w-10 h-10 mt-1 text-purple-400 hover:text-purple-600 cursor-pointer"
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
              className="flex-1 pl-4 py-2 rounded-full bg-white text-black text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((q) => (
            <QuestionCard key={q.id} {...q} onToggleLike={() => handleQuestionLike(q.id)}/>
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
    </div>
  );
}
