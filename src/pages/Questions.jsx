// src/pages/Questions.jsx
import { useState } from "react";
import Header from "../components/Header";
import QuestionCard from "../components/cards/QuestionCard";
import CreateQuestionModal from "../components/modals/CreateQuestionModal";
import Pagination from "../components/Pagination";
import { PlusCircle } from "lucide-react";

export default function Questions() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // 예시 질문들
  const [questions, setQuestions] = useState([
    {
      id: 1,
      accepted: false,
      title: "자바 스크립트 튜토리얼 추천",
      excerpt:
        "자바스크립트를 처음 배우려고 하는데, 추천해주실만한 튜토리얼 사이트나 강좌를 알려주세요. 온라인에서 무료로 배울 수 있는 자료가 좋지만, 유료도 괜찮습니다.",
      author: "이호준",
      date: "2025-04-10",
      dateTime: "2025-04-10T10:30:00",
      answers: 0,
      views: 0,
    },
    {
      id: 2,
      accepted: false,
      title: "자바 스크립트 튜토리얼 추천",
      excerpt:
        "자바스크립트를 처음 배우려고 하는데, 추천해주실만한 튜토리얼 사이트나 강좌를 알려주세요. 온라인에서 무료로 배울 수 있는 자료가 좋지만, 유료도 괜찮습니다.",
      author: "이호준",
      date: "2025-04-10",
      dateTime: "2025-04-10T10:30:00",
      answers: 0,
      views: 0,
    },
    {
      id: 3,
      accepted: false,
      title: "자바 스크립트 튜토리얼 추천",
      excerpt:
        "자바스크립트를 처음 배우려고 하는데, 추천해주실만한 튜토리얼 사이트나 강좌를 알려주세요. 온라인에서 무료로 배울 수 있는 자료가 좋지만, 유료도 괜찮습니다.",
      author: "이호준",
      date: "2025-04-10",
      dateTime: "2025-04-10T10:30:00",
      answers: 0,
      views: 0,
    },
    {
      id: 4,
      accepted: false,
      title: "자바 스크립트 튜토리얼 추천",
      excerpt:
        "자바스크립트를 처음 배우려고 하는데, 추천해주실만한 튜토리얼 사이트나 강좌를 알려주세요. 온라인에서 무료로 배울 수 있는 자료가 좋지만, 유료도 괜찮습니다.",
      author: "이호준",
      date: "2025-04-10",
      dateTime: "2025-04-10T10:30:00",
      answers: 0,
      views: 0,
    },
    {
      id: 5,
      accepted: false,
      title: "자바 스크립트 튜토리얼 추천",
      excerpt:
        "자바스크립트를 처음 배우려고 하는데, 추천해주실만한 튜토리얼 사이트나 강좌를 알려주세요. 온라인에서 무료로 배울 수 있는 자료가 좋지만, 유료도 괜찮습니다.",
      author: "이호준",
      date: "2025-04-10",
      dateTime: "2025-04-10T10:30:00",
      answers: 0,
      views: 0,
    },
    {
      id: 6,
      accepted: false,
      title: "자바 스크립트 튜토리얼 추천",
      excerpt:
        "자바스크립트를 처음 배우려고 하는데, 추천해주실만한 튜토리얼 사이트나 강좌를 알려주세요. 온라인에서 무료로 배울 수 있는 자료가 좋지만, 유료도 괜찮습니다.",
      author: "이호준",
      date: "2025-04-10",
      dateTime: "2025-04-10T10:30:00",
      answers: 0,
      views: 0,
    },
    
  ]);

  // 새 질문 생성
  const handleCreateQuestion = (newQ) => {
    setQuestions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        accepted: false,
        title: newQ.title,
        excerpt: newQ.excerpt,
        author: newQ.author,
        date: new Date().toISOString().slice(0, 10),
        dateTime: new Date().toISOString(),
        answers: 0,
        views: 0,
      },
    ]);
    setShowModal(false);
  };

  // 검색 필터링
  const filtered = questions.filter((q) =>
    q.title.includes(search)
  );

  // **페이지네이션 로직** — 1페이지에 4개씩
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 4;
  const totalPages = Math.ceil(filtered.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const currentQuestions = filtered.slice(
    startIndex,
    startIndex + questionsPerPage
  );

  return (
    <div className="min-h-screen bg-[#282A36] text-white">
      <Header />

      <div className="p-8">
        {/* 상단: 타이틀 + 새 질문 버튼 + 검색 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7 gap-4">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            질문 게시판            
          </h1>
          <div className="flex items-center w-full md:w-64 space-x-2">
            <PlusCircle
              className="w-10 h-10 text-purple-400 hover:text-purple-600 cursor-pointer"
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

        {/* 질문 목록 (현재 페이지 항목만) */}
        <div className="space-y">
          {currentQuestions.map((q) => (
            <QuestionCard key={q.id} {...q} />
          ))}
        </div>

        {/* 페이지네이션 */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 생성 모달 */}
      <CreateQuestionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateQuestion}
      />
    </div>
  );
}
