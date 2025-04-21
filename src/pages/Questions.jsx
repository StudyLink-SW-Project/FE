import { useState } from "react";
import Header from "../components/Header";
import QuestionCard from "../components/QuestionCard";
import { Search, PlusCircle } from "lucide-react";

export default function Questions() {
  const [search, setSearch] = useState("");

  // 예시 데이터
  const data = [
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
  ];

  // 검색 필터링
  const filtered = data.filter((q) =>
    q.title.includes(search)
  );

  return (
    <div className="min-h-screen bg-[rgb(40,42,54)] text-white">
      <Header />

      <div className="p-8">
        {/* 상단: 타이틀 + 새 질문 버튼 + 검색창 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            질문 게시판
            <PlusCircle className="w-6 h-6 hover:text-purple-400 cursor-pointer" />
          </h1>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-full bg-gray-600 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="w-5 h-5 text-gray-300 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* 질문 목록 */}
        <div className="space-y-4">
          {filtered.map((q) => (
            <QuestionCard key={q.id} {...q} />
          ))}
        </div>

        {/* 페이지 내비게이션 (예시) */}
        <div className="flex justify-center items-center mt-8 space-x-3 text-gray-400">
          <button className="hover:text-white">&laquo;</button>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              className={
                n === 1
                  ? "text-white font-semibold"
                  : "hover:text-white"
              }
            >
              {n}
            </button>
          ))}
          <button className="hover:text-white">&raquo;</button>
        </div>
      </div>
    </div>
  );
}
