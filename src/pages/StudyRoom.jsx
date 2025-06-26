// src/pages/StudyRoom.jsx - 페이지네이션 잘림 문제 해결
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import StudyRoomCard from "../components/cards/StudyRoomCard";
import CreateRoomModal from "../components/modals/CreateRoomModal";
import Pagination from "../components/Pagination";
import JoinRoomModal from "../components/modals/JoinRoomModal";
import { PlusCircle, RotateCw, Users, CircleHelp } from "lucide-react";
import { toast } from "react-toastify";
import { useTheme } from "../contexts/ThemeContext"; 
import { StudyOverview } from "../components/StudyOverview";
import HelpModal from "../components/modals/HelpModal";

export default function StudyRoom() {
  const { state, pathname } = useLocation();
  const navigate = useNavigate();

  const initMinutes    = state?.savedMinutes ?? 0;
  const initShowModal  = state?.showSavedModal ?? false;

  const [showSavedModal, setShowSavedModal] = useState(initShowModal);
  const [savedMinutes]   = useState(initMinutes);

  const { isDark } = useTheme();

  const [todayTime] = useState(50);
  const [goalHours, setGoalHours] = useState(() => Number(localStorage.getItem('goalHours') ?? 2));
  const [goalMinutes, setGoalMinutes] = useState(() => Number(localStorage.getItem('goalMinutes') ?? 0));
  const [resolution, setResolution] = useState(() => localStorage.getItem('resolution') || '');

  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // join 모달 관련 state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 15;

  // 서버에서 가져온 방 목록
  const [rooms, setRooms] = useState([]);

  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // API 기본 URL
  const API = import.meta.env.VITE_APP_SERVER;

  // ✅ 이미지 번호를 실제 경로로 매핑하는 함수
  const getImagePath = (imageNumber) => {
    const imageMap = {
      '1': '/bg/bg-1.jpg',
      '2': '/bg/bg-2.jpg', 
      '3': '/bg/bg-3.jpg',
      '4': '/bg/bg-4.jpg'
    };
    return imageMap[String(imageNumber)] || '/bg/bg-1.jpg'; // 기본값
  };

  // 1) 방 목록 조회 로직을 별도 함수로 분리
const fetchRooms = useCallback(async () => {
  try {
    const resp = await fetch(`${API}room/rooms`);
    if (!resp.ok) throw new Error(`목록 조회 실패 (${resp.status})`);
    const data = await resp.json();
    console.log("room/rooms 응답:", data);

    const roomsArray = data.rooms || data.result?.rooms;
    if (!Array.isArray(roomsArray)) {
      throw new Error("rooms 배열을 찾을 수 없습니다");
    }

    setRooms(
      roomsArray.map((r) => ({
        participants: r.participantsCounts,
        maxParticipants: r.maxParticipants || 4,
        title: r.roomName,
        roomDescription: r.roomDescription || "1", 
        imageNumber: r.roomImage,         
        imageSrc:    getImagePath(r.roomImage),  
        isLocked: !!(r.password && r.password.trim()),
        password: r.password || "",
      }))
    );
  } catch (err) {
    console.error(err);
    toast.error(err.message);
  }
}, [API]);

  // 2) 마운트 시 자동 호출
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // 모달에서 "입장" 눌렀을 때
  const handleEnter = (roomId, token, password, roomDescription, img, goalSeconds) => {
    // token, participantName 은 필요하시면 state로 넘기세요
    navigate(`/study-room/${roomId}`, { state: { token, roomName: roomId, password, roomDescription, img, goalSeconds} });
  };

  const filtered = rooms.filter((r) => r.title.includes(search));

  const totalPages = Math.ceil(filtered.length / roomsPerPage);
  const startIdx = (currentPage - 1) * roomsPerPage;
  const currentRooms = filtered.slice(startIdx, startIdx + roomsPerPage);

  // 새 방 생성 핸들러 - CreateRoomModal에서 전달받은 데이터로 방 생성
  const handleCreate = (newRoom) => {
    setRooms((prev) => [
      ...prev,
      {
        id: prev.length,
        participants: 1,
        maxParticipants: newRoom.maxUsers || 4,
        title: newRoom.roomName,
        roomDescription: newRoom.description,
        imageSrc: newRoom.bgImagePath, 
        isLocked: newRoom.isLocked,
        password: newRoom.password || "", 
      },
    ]);
    setShowCreateModal(false);
  };

  // 목표 시간 변경 핸들러
  const handleGoalChange = (h, m) => {   
    setGoalHours(h);
    setGoalMinutes(m);
  };

  // 설정 값 로컬 저장
  useEffect(() => { localStorage.setItem('goalHours', goalHours); }, [goalHours]);
  useEffect(() => { localStorage.setItem('goalMinutes', goalMinutes); }, [goalMinutes]);
  useEffect(() => { localStorage.setItem('resolution', resolution); }, [resolution]);

  // 처음 마운트될 때만, 플래그가 true 였다면 모달 띄우기
  useEffect(() => {
    if (initShowModal) {
      setShowSavedModal(true);
    }
  }, [initShowModal]);

  const handleCloseSavedModal = () => {
    setShowSavedModal(false);
    // 필요하면 history.replaceState 로 location.state 초기화
    navigate(pathname, {
      replace: true,
      state: null
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#282A36] text-white' : 'bg-[#EFF1FE] text-gray-900'}`}>
      <Header />
      
      {/* 메인 컨텐츠 영역 - 스크롤 가능 */}
      <div className="flex-1 py-4 sm:py-6 md:py-8 px-4 sm:px-6 lg:px-8">
        
        {/* 헤더 영역 - 고정된 높이 */}
        <div className="mb-4 sm:mb-6">
          
          {/* 모바일/태블릿: 세로 배치 */}
          <div className="block lg:hidden">
            {/* 제목 + 새로고침 */}
            <div className="flex flex-row items-center gap-3 mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold flex-shrink-0">
                스터디 룸
              </h1>
              <button
                onClick={fetchRooms}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer"
                title="목록 새로고침"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer"
                title="도움말"
              >
                <CircleHelp className="w-5 h-5" />
              </button>
            </div>

            {/* 검색 영역 - 모바일/태블릿 (고정된 높이 공간) */}
            <div className="h-12 mb-4 flex items-center">
              {rooms.length > 0 ? (
                <div className="flex items-center gap-3 w-full sm:max-w-sm">
                  <PlusCircle
                    className={`w-8 h-8 md:w-10 md:h-10 cursor-pointer flex-shrink-0 transition-colors ${
                      isDark ? 'text-blue-400 hover:text-blue-500' : 'text-blue-500 hover:text-blue-600'
                    }`}
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
                    className={`
                      flex-1 sm:w-40 pl-3 sm:pl-4 py-2 rounded-full text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${isDark
                        ? 'bg-white text-black placeholder-gray-400'
                        : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'}
                    `}
                  />
                </div>
              ) : (
                // 빈 공간 유지 (높이는 고정)
                <div className="w-full h-full"></div>
              )}
            </div>

            {/* StudyOverview - 모바일/태블릿 */}
            <div className="w-full mb-4">
              <StudyOverview
                todayTime={todayTime}
                goalHours={goalHours}
                goalMinutes={goalMinutes}
                resolution={resolution}
                onResolutionChange={setResolution}
                onGoalChange={handleGoalChange}
              />
            </div>
          </div>

          {/* PC: 기존 가로 배치 */}
          <div className="hidden lg:flex justify-between items-start gap-1">
            
            {/* 왼쪽: 제목 + 새로고침 */}
            <div className="flex flex-row items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold flex-shrink-0">
                스터디 룸
              </h1>
              <button
                onClick={fetchRooms}
                className="p-2 mt-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition cursor-pointer"
                title="목록 새로고침"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-2 mt-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition cursor-pointer"
                title="도움말"
              >
                <CircleHelp className="w-5 h-5" />
              </button>
            </div>

            {/* 가운데: StudyOverview - PC */}
            <div className="w-3/4 -mt-2 ml-70">
              <StudyOverview
                todayTime={todayTime}
                goalHours={goalHours}
                goalMinutes={goalMinutes}
                resolution={resolution}
                onResolutionChange={setResolution}
                onGoalChange={handleGoalChange}
              />
            </div>

            {/* 오른쪽: 검색 영역 - PC (고정된 높이 공간) */}
            <div className="w-full max-w-xs mt-3 self-start h-12 flex items-center">
              {rooms.length > 0 ? (
                <div className="flex items-center gap-3 w-full">
                  <PlusCircle
                    className={`w-8 h-8 md:w-10 md:h-10 cursor-pointer flex-shrink-0 transition-colors ${
                      isDark ? 'text-blue-400 hover:text-blue-500' : 'text-blue-500 hover:text-blue-600'
                    }`}
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
                    className={`
                      flex-1 pl-4 py-2 rounded-full text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${isDark
                        ? 'bg-white text-black placeholder-gray-400'
                        : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'}
                    `}
                  />
                </div>
              ) : (
                // 빈 공간 유지 (높이는 고정)
                <div className="w-full h-full"></div>
              )}
            </div>
          </div>
        </div>

        {/* 컨텐츠 영역 - 여백 추가 */}
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 pb-8 sm:pb-12 md:pb-16">
          {/* 방이 없을 때 표시할 메시지 */}
          {currentRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 md:py-10">
              <Users className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-4 sm:mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <h2 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {search ? '검색 결과가 없습니다' : '현재 생성된 스터디 룸이 없습니다'}
              </h2>
              <p className={`text-center mb-6 sm:mb-8 text-sm sm:text-base px-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                {search 
                  ? '다른 검색어로 시도하거나 새로운 스터디 룸을 생성해보세요'
                  : '새로운 스터디 룸을 생성하여 함께 공부해보세요'
                }
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors cursor-pointer text-sm sm:text-base"
              >
                스터디 룸 생성하기
              </button>
            </div>
          ) : (
            <>
              {/* 카드 그리드 - 아래 여백 추가 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8 lg:gap-10 justify-items-center mb-8 sm:mb-12">
                {currentRooms.map((room) => (
                  <div
                    key={room.title}
                    className="cursor-pointer w-full max-w-[200px]"
                    onClick={() => {
                      setSelectedRoom(room);
                      setShowJoinModal(true);
                    }}
                  >
                    <StudyRoomCard {...room} />
                  </div>
                ))}
              </div>

              {/* 페이지네이션 - 추가 여백 */}
              <div className="mb-4 sm:mb-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
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
      {/* ④ 도움말 모달 */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
      {/* 저장 완료 모달 */}
      {showSavedModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-opacity-70 backdrop-brightness-20 z-999">
          <div className={`${isDark ? 'bg-[#282A36] text-white' : 'bg-white text-black'} rounded-lg p-6 w-85`}>
            <h2 className="text-xl font-semibold mb-4">저장 완료!</h2>
            <p className="mb-6">오늘 공부 시간 {savedMinutes}분이 저장되었습니다.</p>
            
            {/* 버튼을 오른쪽 끝에 정렬하는 래퍼 */}
            <div className="flex justify-end">
              <button
                onClick={handleCloseSavedModal}
                className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}