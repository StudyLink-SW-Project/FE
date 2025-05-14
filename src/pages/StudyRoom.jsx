// // src/pages/StudyRoom.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Header from "../components/Header";
// import StudyRoomCard from "../components/cards/StudyRoomCard";
// import CreateRoomModal from "../components/modals/CreateRoomModal";
// import JoinRoomModal from "../components/modals/JoinRoomModal";
// import Pagination from "../components/Pagination";
// import { Search, PlusCircle } from "lucide-react";

// export default function StudyRoom() {
//   const navigate = useNavigate();

//   const [search, setSearch] = useState("");
//   const [showCreateModal, setShowCreateModal] = useState(false);

//   // 입장 모달 관련 상태
//   const [selectedRoom, setSelectedRoom] = useState(null);
//   const [showJoinModal, setShowJoinModal] = useState(false);

//   const [currentPage, setCurrentPage] = useState(1);
//   const roomsPerPage = 15;

//   const [rooms, setRooms] = useState(
//     Array.from({ length: 0 }, (_, i) => ({
//       id: i,
//       participants: 1,
//       maxParticipants: 4,
//       title: `공부합시다! ${i + 1}`,
//       subtitle: "화이팅!",
//       imageSrc: "/book1.jpg",
//       isLocked: false,
//     }))
//   );

//   // 검색 필터링
//   const filtered = rooms.filter((r) => r.title.includes(search));

//   // 페이지네이션 계산
//   const totalPages = Math.ceil(filtered.length / roomsPerPage);
//   const startIdx = (currentPage - 1) * roomsPerPage;
//   const currentRooms = filtered.slice(startIdx, startIdx + roomsPerPage);

//   // 새 방 생성 핸들러
//   const handleCreate = (newRoom) => {
//     setRooms((prev) => [
//       ...prev,
//       {
//         id: prev.length,
//         participants: 1,
//         maxParticipants: newRoom.maxUsers || 4,
//         title: newRoom.roomName,
//         subtitle: newRoom.description,
//         imageSrc: newRoom.bgFile
//           ? URL.createObjectURL(newRoom.bgFile)
//           : "/study-room.png",
//         isLocked: newRoom.isLocked,
//       },
//     ]);
//     setShowCreateModal(false);
//   };

//   // 카드 클릭 시 입장 모달 열기
//   const handleCardClick = (room) => {
//     setSelectedRoom(room);
//     setShowJoinModal(true);
//   };

//   // 🌟 토큰(state)과 닉네임을 받아서 페이지 이동
//   const handleEnterRoom = (roomId, token, name) => {
//     setShowJoinModal(false);
//     navigate(
//       `/study-room/${roomId}`,
//       { state: { token, name } }      // <-- 여기에 넘겨줍니다
//     );
//   };

//   return (
//     <div className="min-h-screen bg-[#282A36] text-white">
//       <Header />

//       {/* 상단 타이틀/검색 */}
//       <div className="py-8 px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-4xl font-bold flex items-center gap-2">
//             스터디 룸
//             <PlusCircle
//               className="w-6 h-6 hover:text-blue-400 cursor-pointer"
//               onClick={() => setShowCreateModal(true)}
//             />
//           </h1>
//           <div className="relative w-64">
//             <input
//               type="text"
//               placeholder="검색"
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="w-full pl-4 pr-10 py-2 rounded-full bg-white text-black text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <Search className="w-5 h-5 text-gray-300 absolute right-3 top-1/2 -translate-y-1/2" />
//           </div>
//         </div>

//         {/* 카드 그리드 */}
//         <div className="container mx-auto mt-10 px-2 sm:px-4 lg:px-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1 justify-items-center">
//             {currentRooms.map((room) => (
//               <div
//                 key={room.id}
//                 className="cursor-pointer"
//                 onClick={() => handleCardClick(room)}
//               >
//                 <StudyRoomCard {...room} />
//               </div>
//             ))}
//           </div>

//           {/* 페이지네이션 */}
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={setCurrentPage}
//           />
//         </div>
//       </div>

//       {/* 방 생성 모달 */}
//       <CreateRoomModal
//         isOpen={showCreateModal}
//         onClose={() => setShowCreateModal(false)}
//         onCreate={handleCreate}
//       />

//       {/* 스터디룸 입장 모달 */}
//       <JoinRoomModal
//         room={selectedRoom}
//         isOpen={showJoinModal}
//         onClose={() => setShowJoinModal(false)}
//         onEnter={handleEnterRoom}  // 변경된 부분
//       />
//     </div>
//   );
// }
// src/pages/StudyRoom.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import StudyRoomCard from "../components/cards/StudyRoomCard";
import CreateRoomModal from "../components/modals/CreateRoomModal";
import Pagination from "../components/Pagination";
import { Search, PlusCircle } from "lucide-react";

export default function StudyRoom() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 15;

  const [rooms, setRooms] = useState(
    Array.from({ length: 0 }, (_, i) => ({
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <div className="flex-1 p-8">
        {/* 상단 타이틀 + 새 생성 + 검색 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-4xl font-bold flex items-center gap-2">
            스터디 룸
            <PlusCircle
              className="w-6 h-6 text-primary hover:text-primary/80 cursor-pointer"
              onClick={() => setShowCreateModal(true)}
            />
          </h1>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="검색"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="
                w-full pl-4 pr-10 py-2 rounded-full
                bg-white dark:bg-gray-700
                text-black dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-primary
                transition
              "
            />
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 justify-items-center">
          {currentRooms.map((room) => (
            <div
              key={room.id}
              className="cursor-pointer"
              onClick={() => navigate(`/study-room/${room.id}`)}
            >
              <StudyRoomCard {...room} />
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="mt-8">
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
