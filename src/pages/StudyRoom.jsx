import { useState } from "react";
import Header from "../components/Header";
import StudyRoomCard from "../components/StudyRoomCard";
import CreateRoomModal from "../components/CreateRoomModal";
import Pagination from "../components/Pagination";
import { Search, PlusCircle } from "lucide-react";

export default function StudyRoom() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 15; // 한 페이지에 보여줄 카드 개수

  // const → state로 변경
  const [rooms, setRooms] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      participants: 1,
      maxParticipants: 4,
      title: `공부합시다! ${i + 1}`,
      subtitle: "화이팅!",
    }))
  );

  // 검색 필터링
  const filtered = rooms.filter((r) => r.title.includes(search));

  // 페이지네이션용 계산
  const totalPages = Math.ceil(filtered.length / roomsPerPage);
  const startIdx = (currentPage - 1) * roomsPerPage;
  const currentRooms = filtered.slice(startIdx, startIdx + roomsPerPage);

  // → 방 생성 시 rooms 상태에 추가
  const handleCreate = (newRoom) => {
    setRooms((prev) => [
      ...prev,
      {
        id: prev.length,
        participants: 1,
        maxParticipants: newRoom.maxUsers || 4,
        title: newRoom.roomName,
        subtitle: newRoom.description,
        imageSrc: newRoom.bgFile
          ? URL.createObjectURL(newRoom.bgFile)
          : "/study-room.png",
          isLocked: newRoom.isLocked,
      },
    ]);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-[#282A36] text-white">
      <Header />

      {/* 상단 타이틀/검색 영역 */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            스터디 룸
            <PlusCircle
              className="w-6 h-6 hover:text-blue-400 cursor-pointer"
              onClick={() => setShowModal(true)}
            />
          </h1>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="검색"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // 검색 시 1페이지로 리셋
              }}
              className="w-full pl-4 pr-10 py-2 rounded-full bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-300 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* 카드 그리드 */}
        {/* <div className="container mx-auto mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 lg:grid-cols-4 justify-items-center"> */}
          <div className="container mx-auto mt-10 px-2 sm:px-4 lg:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1 justify-items-center">
            {currentRooms.map((room) => (
              <StudyRoomCard key={room.id} {...room} isLocked={room.isLocked}/>
            ))}
          </div>

          {/* 공통 페이지네이션 컴포넌트 */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* 방 생성 모달 */}
      <CreateRoomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
