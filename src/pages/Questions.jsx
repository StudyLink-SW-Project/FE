import { useState } from "react";
import Header from "../components/Header";
import QuestionCard from "../components/QuestionCard";
import CreateQuestionModal from "../components/CreateQuestionModal";
import Pagination from "../components/Pagination"; // 공통 컴포넌트 import
import { Search, PlusCircle } from "lucide-react";

export default function Questions() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [questions, setQuestions] = useState([
    {
      id: 1,
      accepted: false,
      title: "자바 스크립트 튜토리얼 추천",
      excerpt:
        "자바 스크립트를 처음 배우려고 하는데, 추천해주실만한 튜토리얼 사이트나 강좌를 알려주세요. 온라인에서 무료로 배울 수 있는 자료가 좋지만, 유료도 괜찮습니다.",
      author: "이호준",
      date: "2025-04-10",
      answers: 6,
      views: 157,
    },
    {
      id: 1,
      accepted: false,
      title: "자바 스크립트 튜토리얼 추천",
      excerpt:
        "자바 스크립트를 처음 배우려고 하는데, 추천해주실만한 튜토리얼 사이트나 강좌를 알려주세요. 온라인에서 무료로 배울 수 있는 자료가 좋지만, 유료도 괜찮습니다.",
      author: "이호준",
      date: "2025-04-10",
      answers: 6,
      views: 157,
    },
  ]);

  const handleCreateQuestion = (newQuestion) => {
    setQuestions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        accepted: false,
        title: newQuestion.title,
        excerpt: newQuestion.excerpt,
        author: "익명",
        date: new Date().toISOString().slice(0, 10),
        answers: 0,
        views: 0,
      },
    ]);
    setShowModal(false);
  };

  const filtered = questions.filter((q) => q.title.includes(search));

  // ✅ 페이지네이션 로직
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  const totalPages = Math.ceil(filtered.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const currentQuestions = filtered.slice(startIndex, startIndex + questionsPerPage);

  return (
    <div className="min-h-screen bg-[#282A36] text-white">
      <Header />

      <div className="p-8">
        {/* 상단: 타이틀 + 버튼 + 검색 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            질문 게시판
            <PlusCircle
              className="w-6 h-6 hover:text-purple-400 cursor-pointer"
              onClick={() => setShowModal(true)}
            />
          </h1>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="검색"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // 검색 시 페이지 초기화
              }}
              className="w-full pl-4 pr-10 py-2 rounded-full bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="w-5 h-5 text-gray-300 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* 질문 목록 */}
        <div className="space-y-4">
          {currentQuestions.map((q) => (
            <QuestionCard key={q.id} {...q} />
          ))}
        </div>

        {/* ✅ 공통 페이지네이션 컴포넌트 사용 */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 모달 */}
      <CreateQuestionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateQuestion}
      />
    </div>
  );
}
