// src/pages/StudyRoom.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import StudyRoomCard from "../components/cards/StudyRoomCard";
import CreateRoomModal from "../components/modals/CreateRoomModal";
import Pagination from "../components/Pagination";
import { PlusCircle } from "lucide-react";

export default function StudyRoom() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 15;

  const [rooms, setRooms] = useState(
    Array.from({ length: 17 }, (_, i) => ({
      id: i,
      participants: 1,
      maxParticipants: 4,
      title: `공부합시다! ${i + 1}`,
      subtitle: "화이팅!",
      imageSrc: "/book1.jpg",
      isLocked: false,
    }))
  );

  // 검색 필터링
  const filtered = rooms.filter((r) => r.title.includes(search));

  // 페이지네이션 계산
  const totalPages = Math.ceil(filtered.length / roomsPerPage);
  const startIdx = (currentPage - 1) * roomsPerPage;
  const currentRooms = filtered.slice(startIdx, startIdx + roomsPerPage);

  // 새 방 생성 핸들러
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
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-[#282A36] text-white">
      <Header />

      {/* 상단 타이틀/검색 */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold flex items-center mb-5 gap-2 mt-1">
            스터디 룸           
          </h1>
          <div className="flex items-center w-full md:w-64 space-x-3">
            <PlusCircle
              className="w-10 h-10 mt-1 text-blue-400 hover:text-blue-600 cursor-pointer"
              onClick={() => setShowCreateModal(true)}
            />
            <input
              type="text"
              placeholder="검색"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 w-full pl-4 py-2 rounded-full bg-white text-black text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 카드 그리드 */}
        <div className="container mx-auto mt-10 px-2 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 justify-items-center">
            {currentRooms.map((room) => (
              <div
                key={room.id}
                className="cursor-pointer"
                onClick={() => navigate("/video-room")}
              >
                <StudyRoomCard {...room} />
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* 방 생성 모달 */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
