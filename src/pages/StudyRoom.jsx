import { useState } from "react";
import Header from "../components/Header";
import StudyRoomCard from "../components/StudyRoomCard";
import { Search, PlusCircle } from "lucide-react";

export default function StudyRoom() {
  // 임시 데이터
  const rooms = Array.from({ length: 1 }, (_, i) => ({
    id: i,
    participants: 1,
    maxParticipants: 4,
    //imageSrc: "/study-room.png",   // public 폴더에 저장된 샘플 이미지
    title: "공부합시다!",
    subtitle: "화이팅!",
  }));

  const [search, setSearch] = useState("");

  // 검색 필터링 (예시)
  const filtered = rooms.filter((r) =>
    r.title.includes(search)
  );

  return (
    <div className="min-h-screen bg-[rgb(40,42,54)] text-white">
      <Header />

      <div className="p-8">
        {/* 타이틀 + 방 생성 버튼 + 검색창 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            스터디 룸
            <PlusCircle className="w-6 h-6 hover:text-blue-400 cursor-pointer" />
          </h1>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-full bg-gray-600 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-300 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* 방 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((room) => (
            <StudyRoomCard key={room.id} {...room} />
          ))}
        </div>

        {/* 페이징 (예시) */}
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
