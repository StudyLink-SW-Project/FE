// src/pages/StudyRoom.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import StudyRoomCard from "../components/cards/StudyRoomCard";
import CreateRoomModal from "../components/modals/CreateRoomModal";
import Pagination from "../components/Pagination";
import JoinRoomModal from "../components/modals/JoinRoomModal";
import { PlusCircle, Users } from "lucide-react";
import { toast } from "react-toastify";

export default function StudyRoom() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // join 모달 관련 state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 15;

  // 서버에서 가져온 방 목록
  const [rooms, setRooms] = useState([]);

  // API 기본 URL
  const API = import.meta.env.VITE_APP_SERVER;
  // 마운트 시 방 목록 조회
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`${API}room/rooms`);
        if (!resp.ok) throw new Error(`목록 조회 실패 (${resp.status})`);
        const data = await resp.json();
        console.log("room/rooms 응답:", data);
        const roomsArray = data.rooms || data.result?.rooms; 
      if (!Array.isArray(roomsArray)) {
        throw new Error("rooms 배열을 찾을 수 없습니다");
      }
      const roomsDto = data.result?.rooms ?? [];
      setRooms(
        roomsDto.map((r) => ({
            id: r.sid,
            participants: r.numParticipants,
            maxParticipants: 4,
            title: r.name,
            subtitle: r.metadata || "",
            imageSrc: "/study-room.png",
            isLocked: false,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error(err.message);
      }
    })();
  }, [API]);

  // 모달에서 "입장" 눌렀을 때
  const handleEnter = (roomId, token) => {
    // token, participantName 은 필요하시면 state로 넘기세요
    navigate(`/study-room/${roomId}`, { state: { token, roomName: roomId } });
  };

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

        {/* 컨텐츠 영역 */}
        <div className="container mx-auto mt-10 px-2 sm:px-4 lg:px-6">
          {/* 방이 없을 때 표시할 메시지 */}
          {currentRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Users className="w-24 h-24 text-gray-500 mb-6" />
              <h2 className="text-2xl font-bold text-gray-400 mb-4">
                {search ? '검색 결과가 없습니다' : '현재 생성된 스터디 룸이 없습니다'}
              </h2>
              <p className="text-gray-500 text-center mb-8">
                {search 
                  ? '다른 검색어로 시도하거나 새로운 스터디 룸을 생성해보세요'
                  : '새로운 스터디 룸을 생성하여 함께 공부해보세요'
                }
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors cursor-pointer"
              >
                스터디 룸 생성하기
              </button>
            </div>
          ) : (
            <>
              {/* 카드 그리드 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-40 justify-items-center">
                {currentRooms.map((room) => (
                  <div
                    key={room.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedRoom(room);
                      setShowJoinModal(true);
                    }}
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
            </>
          )}
        </div>
      </div>

      {/* 방 생성 모달 */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        onEnter={handleEnter}
      />

      {/* 방 입장 모달 */}
      <JoinRoomModal
        room={selectedRoom}
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onEnter={handleEnter}
      />
    </div>
  );
}