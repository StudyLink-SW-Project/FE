// src/pages/StudyRoomInside.jsx
import { useParams, Link } from "react-router-dom";
import { Users } from "lucide-react";

export default function StudyRoomInside() {
  const { id } = useParams();

  // TODO: 실제 API나 Context에서 받아온 데이터로 교체하세요.
  const roomInfo = {
    title: `공부합시다! (${id})`,
    participants: 4,
    maxParticipants: 4,
    createdAt: "2025-04-11 15:01",
    users: ["user01", "user02", "user03", "user04"],
    messages: [
      { id: 1, author: "user01", text: "안녕하세요!" },
      { id: 2, author: "user02", text: "시작해볼까요?" },
      // … 더 많은 메시지
    ],
  };

  return (
    <div className="min-h-screen bg-[#282A36] text-white flex flex-col">
      {/* 상단 방 정보 */}
      <div className="px-8 py-3 flex items-center border-b border-[#616680] gap-4">
        <h2 className="text-xl font-semibold">{roomInfo.title}</h2>
        <span className="flex items-center gap-1 text-sm">
          <Users className="w-4 h-4" /> {roomInfo.participants}
        </span>
        <span className="text-sm text-gray-400">{roomInfo.createdAt}</span>
      </div>

      {/* 본문: 비디오 그리드 + 우측 사이드바 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 비디오 그리드 */}
        <div className="grid grid-cols-2 gap-4 p-4 flex-1 overflow-auto">
          {roomInfo.users.map((u) => (
            <div
              key={u}
              className="relative bg-[#1D1F2C] rounded-lg aspect-video flex items-center justify-center"
            >
              <span className="text-gray-500">{u} 비디오</span>
            </div>
          ))}
        </div>

        {/* 우측 사이드바 */}
        <aside className="w-80 p-4 flex flex-col h-full space-y-4">
          {/* 참가자 카드 */}
          <div className="bg-white text-black rounded-xl p-4 shadow">
            <h3 className="text-center font-medium mb-2">
              참가자 수: {roomInfo.participants}
            </h3>
            <hr className="border-gray-300 mb-3" />
            <ul className="space-y-2">
              {roomInfo.users.map((u) => (
                <li key={u} className="flex items-center gap-3">
                  <img
                    src={`/avatars/${u}.png`}
                    alt={u}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm">{u}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 메시지 카드 (메시지 리스트를 h-80으로 고정) */}
          <div className="bg-white text-black rounded-xl p-4 flex flex-col shadow overflow-hidden">
            <h3 className="text-center font-medium mb-2">메시지</h3>
            <hr className="border-gray-300 mb-3" />
            {/* 이 부분이 길어집니다 */}
            <div className="h-80 overflow-auto mb-3 space-y-2">
              {roomInfo.messages.length === 0 ? (
                <p className="text-gray-500 italic">아직 대화가 없습니다.</p>
              ) : (
                roomInfo.messages.map((m) => (
                  <div key={m.id}>
                    <span className="font-semibold">{m.author}: </span>
                    <span>{m.text}</span>
                  </div>
                ))
              )}
            </div>
            <form className="flex gap-1">
              <input
                type="text"
                placeholder="메시지를 입력하세요"
                className="flex-1 border border-gray-300 rounded-l px-3 py-2 outline-none"
              />
                <button
                  type="submit"
                      className="
                        bg-black text-white
                        px-3 py-2
                        rounded-r
                        hover:bg-gray-800
                        transition
                        whitespace-nowrap   /* 줄 바꿈 방지 */
                        text-center         /* 가운데 정렬 */
                      "
                >
                  전송
                </button>
            </form>
          </div>

          {/* 컨트롤 버튼 (채팅창 밑으로 이동) */}
          <div className="flex justify-center gap-4">
            <button className="bg-green-500 p-3 rounded-full">🎤</button>
            <button className="bg-purple-500 p-3 rounded-full">📹</button>
            <Link to="/study-room">
              <button className="bg-red-500 p-3 rounded-full">🚪</button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
