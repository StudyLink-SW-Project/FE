// src/pages/StudyRoom.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import StudyRoomCard from "../components/cards/StudyRoomCard";
import CreateRoomModal from "../components/modals/CreateRoomModal";
import Pagination from "../components/Pagination";
import JoinRoomModal from "../components/modals/JoinRoomModal";
import { PlusCircle } from "lucide-react";

export default function StudyRoom() {
  const navigate = useNavigate();

  // API 베이스 URL (DEV: 현재 도메인, PROD: 환경변수)
  const API = import.meta.env.DEV ? "/" : import.meta.env.VITE_APP_SERVER;

  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // join 모달 관련 state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 15;

  // 서버에서 불러온 방 목록
  const [rooms, setRooms] = useState([]);

  // 1) 컴포넌트 마운트 시 서버에서 방 목록 조회
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`${API}study-room/list`, {
          credentials: "include",
        });
        const json = await resp.json();
        if (!json.isSuccess) {
          throw new Error(json.message || "방 목록 조회에 실패했습니다.");
        }
        // 예: json.result === [{ id, name, currentParticipants, maxParticipants, ... }, …]
        setRooms(
          json.result.map((r) => ({
            id: r.id,
            title: r.name,
            participants: r.currentParticipants,
            maxParticipants: r.maxParticipants,
            subtitle: r.description || "",
            imageSrc: "/study-room.png", // 기본 이미지
            isLocked: !!r.isLocked,
          }))
        );
      } catch (err) {
        console.error(err);
        // (원한다면 toast.error(err.message) 등)
      }
    })();
  }, [API]);

  // 카드 클릭 → Join 모달 열기
  const handleCardClick = (room) => {
    setSelectedRoom(room);
    setShowJoinModal(true);
  };

  // Join 모달 닫기
  const handleJoinClose = () => {
    setShowJoinModal(false);
    setSelectedRoom(null);
  };

  // Join 모달에서 입장 클릭
  const handleEnter = (roomId, token, participantName) => {
    navigate(`/study-room/${roomId}`, {
      state: { token, participantName },
    });
  };

  // 검색 필터링
  const filtered = rooms.filter((r) => r.title.includes(search));

  // 페이지네이션 계산
  const totalPages = Math.ceil(filtered.length / roomsPerPage);
  const startIdx = (currentPage - 1) * roomsPerPage;
  const currentRooms = filtered.slice(startIdx, startIdx + roomsPerPage);

  // (기존) 방 생성 로직
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
          <h1 className="text-4xl font-bold flex items-center gap-2">
            스터디 룸
          </h1>
          <div className="flex items-center w-full md:w-64 space-x-3">
            <PlusCircle
              className="w-10 h-10 text-blue-400 hover:text-blue-600 cursor-pointer"
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
              className="flex-1 pl-4 py-2 rounded-full bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 카드 그리드 */}
        <div className="container mx-auto px-2 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 justify-items-center">
            {currentRooms.map((room) => (
              <div
                key={room.id}
                className="cursor-pointer"
                onClick={() => handleCardClick(room)}
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

      {/* 방 입장 모달 */}
      <JoinRoomModal
        room={selectedRoom}
        isOpen={showJoinModal}
        onClose={handleJoinClose}
        onEnter={handleEnter}
      />
    </div>
  );
}
