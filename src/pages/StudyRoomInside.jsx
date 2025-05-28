// // src/pages/StudyRoomInside.jsx
// import { useParams, useLocation, Link } from "react-router-dom";
// import { Users } from "lucide-react";
// import { useEffect, useState, useCallback } from "react";
// import { Room, RoomEvent, LocalVideoTrack } from "livekit-client";
// import VideoComponent from "../components/VideoComponent";
// import AudioComponent from "../components/AudioComponent";
// import { useSelector } from "react-redux";
// import { Chat, RoomContextProvider } from "@livekit/components-react";

// // 토큰 발급 서버
// const APP_SERVER = "https://api.studylink.store/";
// // LiveKit WebSocket URL 설정
// const LIVEKIT_URL =
//   window.location.hostname === "localhost"
//     ? "ws://localhost:7880/"
//     : "wss://api.studylink.store:443";

// export default function StudyRoomInside() {
//   const { id } = useParams();
//   const { state } = useLocation();
//   const tokenFromModal = state?.token;
//   const reduxUser = useSelector((state) => state.auth.user);
//   const participantName = state?.participantName || reduxUser?.userName || "Guest";

//   const [room, setRoom] = useState(null);
//   const [localTrack, setLocalTrack] = useState(null);
//   const [remoteTracks, setRemoteTracks] = useState([]);
//   const [chatLog, setChatLog] = useState([]);
//   const [camEnabled, setCamEnabled] = useState(true);

//   useEffect(() => {
//     if (!tokenFromModal) return;
//     const r = new Room();
//     setRoom(r);

//     // 핸들러 정의
//     const handleTrackSubscribed = (_track, publication, participant) => {
//       if (publication.kind === "video") {
//         setRemoteTracks(prev => {
//           if (prev.some(r => r.pub.trackSid === publication.trackSid)) return prev;
//           return [...prev, { pub: publication, id: participant.identity }];
//         });
//       }
//     };
//     const handleTrackUnsubscribed = (_track, publication) => {
//       setRemoteTracks(prev => prev.filter(t => t.pub.trackSid !== publication.trackSid));
//     };

//     // 비디오 트랙만 구독하여 저장
//     r.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
//     r.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

//     (async () => {
//       try {
//         const livekitToken =
//           tokenFromModal ||
//           (await (async () => {
//             const res = await fetch(`${APP_SERVER}/api/v1/video/token`, {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ roomName: id, participantName }),
//             });
//             if (!res.ok) throw new Error("토큰 서버 오류");
//             const { token } = await res.json();
//             return token;
//           })());

//         await r.connect(LIVEKIT_URL, livekitToken);
//         await r.localParticipant.enableCameraAndMicrophone();

//         const camPub = Array.from(
//           r.localParticipant.videoTrackPublications.values()
//         ).find(p => p.track instanceof LocalVideoTrack);
//         if (camPub) {
//           setLocalTrack(camPub.track);
//           setCamEnabled(true);
//         }

//         const handleLocalPub = (publication) => {
//           if (publication.track instanceof LocalVideoTrack) {
//             setLocalTrack(publication.track);
//             setCamEnabled(true);
//             r.localParticipant.off(
//               RoomEvent.LocalTrackPublished,
//               handleLocalPub
//             );
//           }
//         };
//         r.localParticipant.on(RoomEvent.LocalTrackPublished, handleLocalPub);
//       } catch (err) {
//         console.error("LiveKit 연결 오류:", err);
//       }
//     })();

//     return () => {
//       r.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
//       r.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
//       r.disconnect();
//       setLocalTrack(null);
//       setRemoteTracks([]);
//     };
//   }, [id, tokenFromModal, participantName]);

//   const toggleCamera = useCallback(() => {
//     if (!room) return;
//     setCamEnabled(prev => {
//       room.localParticipant.setCameraEnabled(!prev);
//       return !prev;
//     });
//   }, [room]);

//   const roomTitle = `${id}`;
//   const uniqueIds = [...new Set(remoteTracks.map(t => t.id))];
//   const participantCount = 1 + uniqueIds.length;

//   return (
//     <div className="min-h-screen bg-[#282A36] text-white flex flex-col">
//       <header className="px-8 py-3 flex items-center border-b border-[#616680] gap-4">
//         <h2 className="text-xl font-semibold">{roomTitle}</h2>
//         <span className="flex items-center gap-1 text-sm">
//           <Users className="w-4 h-4" /> {participantCount}
//         </span>
//       </header>
//       <div className="flex flex-1 overflow-hidden">
//         <div className="grid grid-cols-2 gap-4 p-4 flex-1 overflow-auto">
//           {localTrack && (
//             <VideoComponent
//               track={localTrack}
//               participantIdentity={participantName}
//               local
//             />
//           )}
//           {remoteTracks.filter(t => t.pub.kind === "video").map(t => (
//             <VideoComponent
//               key={t.pub.trackSid}
//               track={t.pub.videoTrack}
//               participantIdentity={t.id}
//             />
//           ))}
//         </div>
//         <aside className="w-80 p-4 flex flex-col h-full space-y-4">
//           <div className="bg-white text-black rounded-xl p-4 shadow">
//             <h3 className="text-center font-medium mb-2">
//               참가자 수: {participantCount}
//             </h3>
//             <hr className="border-gray-300 mb-3" />
//             <ul className="space-y-2">
//               <li className="flex items-center gap-3">
//                 <span className="text-sm">{participantName} (나)</span>
//               </li>
//               {uniqueIds.map(id => (
//                 <li key={id} className="flex items-center gap-3">
//                   <span className="text-sm">{id}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//           {/* 메시지 카드
//           <div className="bg-white text-black rounded-xl p-4 flex flex-col shadow overflow-hidden">
//             <h3 className="text-center font-medium mb-2">메시지</h3>
//             <hr className="border-gray-300 mb-3" />
//             <div className="h-80 overflow-auto mb-3 space-y-2">
//               {chatLog.length === 0 ? (
//                <p className="text-gray-500 italic">아직 대화가 없습니다.</p>
//               ) : (
//                 chatLog.map((m, i) => (
//                   <div key={i}>
//                     <span className="font-semibold">{m.author}: </span>
//                     <span>{m.text}</span>
//                   </div>
//                 ))
//               )}
//             </div>
//             <form
//               className="flex gap-1"
//               onSubmit={e => {
//                 e.preventDefault();
//                 const txt = e.target.elements.msg.value.trim();
//                 if (!txt || !room) return;
//                 room.localParticipant.publishData(
//                   new TextEncoder().encode(txt),
//                   0
//                 );
//                 setChatLog(prev => [...prev, { author: "나", text: txt }]);
//                 e.target.reset();
//               }}
//             >
//               <input
//                 name="msg"
//                 type="text"
//                 placeholder="메시지를 입력하세요"
//                 className="flex-1 border border-gray-300 rounded-l px-3 py-2 outline-none"
//               />
//               <button
//                 type="submit"
//                 className="bg-black text-white px-3 py-2 rounded-r hover:bg-gray-800 transition whitespace-nowrap text-center cursor-pointer"
//               >
//                 전송
//               </button>
//             </form>
//           </div> */}

//           {/* Chat 컴포넌트만 RoomContextProvider로 래핑 */}
//            {room && (
//              <RoomContextProvider room={room}>
//                <div className="flex-1">
//                   <Chat
//                     height="100%"
//                     placeholder="메시지를 입력하세요"
//                     showHeader={true}
//                     headerTitle="채팅"
//                     showInput={true}
//                     theme="dark"
//                   />
//                </div>
//              </RoomContextProvider>
//            )}

//           {/* 컨트롤 버튼 */}
//           <div className="flex justify-center gap-4">
//             <button
//               onClick={toggleCamera}
//               className={`p-3 cursor-pointer rounded-full ${camEnabled ? "bg-purple-500" : "bg-gray-500"}`}
//             >
//               📹
//             </button>
//             <Link to="/study-room">
//               <button className="bg-red-500 p-3 rounded-full cursor-pointer">🚪</button>
//             </Link>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// }

// src/pages/StudyRoomInside.jsx
import { useParams, useLocation, Link, Navigate } from "react-router-dom";
import { Users } from "lucide-react";
import { useSelector } from "react-redux";
import { useParticipants, useLocalParticipant, Chat, VideoTrack, VideoConference } from "@livekit/components-react";

export default function StudyRoomInside() {
  const { id } = useParams();
  const { state } = useLocation();
  const token = state?.token;
  if (!token) {
    return <Navigate to="/study-room" replace />;
  }

  const reduxUser = useSelector((state) => state.auth.user);
  const participantName = reduxUser?.userName || "Guest";

  // LiveKit React Hooks
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  const roomTitle = id;
  const participantCount = 1 + participants.length;

  return (
    <div className="min-h-screen bg-[#282A36] text-white flex flex-col">
      <header className="px-8 py-3 flex items-center border-b border-[#616680] gap-4">
        <h2 className="text-xl font-semibold">{roomTitle}</h2>
        <span className="flex items-center gap-1 text-sm">
          <Users className="w-4 h-4" /> {participantCount}
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 비디오 그리드
        <div className="grid grid-cols-2 gap-4 p-4 flex-1 overflow-auto">
          {localParticipant.videoTrack && (
            <VideoTrack
              
            />
          )}
          {participants
            .filter(p => p.videoTrack)
            .map(p => (
              <VideoTrack
                
              />
            ))}
        </div> */}
        {/* 비디오 컨퍼런스 그리드 */}
        <div className="flex-1 p-4 overflow-auto">
          <VideoConference
          />
        </div>

        {/* 사이드바 */}
        <aside className="w-80 p-4 flex flex-col h-full space-y-4">
          {/* 참가자 카드 */}
          <div className="bg-white text-black rounded-xl p-4 shadow">
            <h3 className="text-center font-medium mb-2">
              참가자 수: {participantCount}
            </h3>
            <hr className="border-gray-300 mb-3" />
            <ul className="space-y-2">
              <li className="flex items-center gap-3">
                <span className="text-sm">{participantName} (나)</span>
              </li>
              {participants.map(p => (
                <li key={p.identity} className="flex items-center gap-3">
                  <span className="text-sm">{p.identity}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 채팅 */}
          <div className="flex-1 bg-white text-black rounded-xl shadow overflow-hidden">
            <Chat
              height="100%"
              placeholder="메시지를 입력하세요"
              showHeader
              headerTitle="채팅"
              showInput
              theme="dark"
            />
          </div>

          {/* 컨트롤 버튼 */}
          <div className="flex justify-center gap-4">
            <button className="p-3 cursor-pointer rounded-full bg-purple-500">
              📹
            </button>
            <Link to="/study-room">
              <button className="bg-red-500 p-3 rounded-full cursor-pointer">
                🚪
              </button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
