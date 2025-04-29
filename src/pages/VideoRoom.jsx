// VideoRoom.jsx
import {
    LocalVideoTrack,
    RemoteParticipant,
    RemoteTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent,
    Track,
    DataPacket_Kind,
  } from 'livekit-client';
  import '../App.css';
  import { useState, useRef, useEffect } from 'react';
  import VideoComponent from '../components/VideoComponent';
  import AudioComponent from '../components/AudioComponent';
  
  /* ----------------------------- 서버 URL 자동 결정 ----------------------------- */
  let APPLICATION_SERVER_URL = '';
  let LIVEKIT_URL = '';
  configureUrls();
  function configureUrls() {
    APPLICATION_SERVER_URL =
      APPLICATION_SERVER_URL ||
      (window.location.hostname === 'localhost'
        ? 'http://localhost:6080/'
        : `https://${window.location.hostname}:6443/`);
  
    LIVEKIT_URL =
      LIVEKIT_URL ||
      (window.location.hostname === 'localhost'
        ? 'ws://localhost:7880/'
        : `wss://${window.location.hostname}:7443/`);
  }
  
  /* ============================================================================ */
  export default function VideoRoom() {
    /* ------------------------- React 상태 ------------------------- */
    const [room, setRoom] = useState();                 // Room 인스턴스
    const [localTrack, setLocalTrack] = useState();     // LocalVideoTrack
    const [remoteTracks, setRemoteTracks] = useState([]); // [{ trackPublication, participantIdentity }]
  
    const [participantName, setParticipantName] = useState(
      'Participant' + Math.floor(Math.random() * 100),
    );
    const [roomName, setRoomName] = useState('Test Room');
  
    const chatInput = useRef(null);                    // 채팅 입력창
    const [chatLog, setChatLog] = useState([]);        // 채팅 내역
  
    /* ------------------------- 룸 이벤트 등록 ------------------------- */
    useEffect(() => {
      if (!room) return;
  
      /** 새 트랙 구독 */
      function handleSubscribed(_track, publication, participant) {
        setRemoteTracks(prev => [
          ...prev,
          { trackPublication: publication, participantIdentity: participant.identity },
        ]);
      }
  
      /** 트랙 제거 */
      function handleUnsubscribed(_track, publication) {
        setRemoteTracks(prev =>
          prev.filter(t => t.trackPublication.trackSid !== publication.trackSid),
        );
      }
  
      /** 데이터 채널(Chat) */
      function handleData(payload, participant) {
        const msg = new TextDecoder().decode(payload);
        setChatLog(prev => [...prev, `${participant.identity}: ${msg}`]);
      }
  
      room
        .on(RoomEvent.TrackSubscribed, handleSubscribed)
        .on(RoomEvent.TrackUnsubscribed, handleUnsubscribed)
        .on(RoomEvent.DataReceived, handleData);
  
      return () => {
        room
          .off(RoomEvent.TrackSubscribed, handleSubscribed)
          .off(RoomEvent.TrackUnsubscribed, handleUnsubscribed)
          .off(RoomEvent.DataReceived, handleData);
      };
    }, [room]);
  
    /* ------------------------- 룸 입장 ------------------------- */
    async function joinRoom() {
      const newRoom = new Room();
      setRoom(newRoom);
  
      try {
        const token = await getToken(roomName, participantName);
  
        await newRoom.connect(LIVEKIT_URL, token);
  
        // 카메라·마이크 퍼블리시
        await newRoom.localParticipant.enableCameraAndMicrophone();
        const firstPub = newRoom.localParticipant.videoTrackPublications.values().next().value;
        setLocalTrack(firstPub?.videoTrack);
      } catch (e) {
        console.error('룸 연결 오류:', e);
        await leaveRoom();
      }
    }
  
    /* ------------------------- 룸 퇴장 ------------------------- */
    async function leaveRoom() {
      await room?.disconnect();
      setRoom(undefined);
      setLocalTrack(undefined);
      setRemoteTracks([]);
      setChatLog([]);
    }
  
    /* ------------------------- 토큰 발급 ------------------------- */
    async function getToken(roomName, participantName) {
      const res = await fetch(APPLICATION_SERVER_URL + 'token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, participantName }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.errorMessage || '토큰 오류');
      }
      const { token } = await res.json();
      return token;
    }
  
    /* ------------------------- 채팅 전송 ------------------------- */
    function sendChat(e) {
      e.preventDefault();
      const text = chatInput.current?.value.trim();
      if (!text || !room) return;
  
      room.localParticipant.publishData(
        new TextEncoder().encode(text),
        DataPacket_Kind.RELIABLE,
      );
      setChatLog(prev => [...prev, `나: ${text}`]);
      chatInput.current.value = '';
    }
  
    /* ------------------------- 트랙 토글 helper ------------------------- */
    function toggleTrack(kind) {
      if (!room) return;
      if (kind === Track.Kind.Audio) {
        room.localParticipant.setMicrophoneEnabled(
          !room.localParticipant.isMicrophoneEnabled,
        );
      } else {
        room.localParticipant.setCameraEnabled(
          !room.localParticipant.isCameraEnabled,
        );
      }
    }
  
    /* 화면 공유 */
    async function toggleScreen() {
      if (!room) return;
      await room.localParticipant.setScreenShareEnabled(
        !room.localParticipant.isScreenShareEnabled,
      );
    }
  
    /* =============================== JSX =============================== */
    return !room ? (
      /* ---------------- 입장 전 UI ---------------- */
      <div id="join">
        <div id="join-dialog">
          <h2>Join a Video Room</h2>
          <form
            onSubmit={e => {
              joinRoom();
              e.preventDefault();
            }}
          >
            <label>
              Participant
              <input
                value={participantName}
                onChange={e => setParticipantName(e.target.value)}
                required
              />
            </label>
            <label>
              Room
              <input
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                required
              />
            </label>
            <button disabled={!participantName || !roomName}>Join!</button>
          </form>
        </div>
      </div>
    ) : (
      /* ---------------- 룸 내부 UI ---------------- */
      <div id="room">
        <header>
          <h2>{roomName}</h2>
          <button onClick={() => toggleTrack(Track.Kind.Audio)}>Mic</button>
          <button onClick={() => toggleTrack(Track.Kind.Video)}>Cam</button>
          <button onClick={toggleScreen}>Share</button>
          <button onClick={leaveRoom}>Leave</button>
        </header>
  
        {/* 비디오 레이아웃 */}
        <section id="layout-container">
          {localTrack && (
            <VideoComponent track={localTrack} participantIdentity={participantName} local />
          )}
          {remoteTracks.map(info =>
            info.trackPublication.kind === 'video' ? (
              <VideoComponent
                key={info.trackPublication.trackSid}
                track={info.trackPublication.videoTrack}
                participantIdentity={info.participantIdentity}
              />
            ) : (
              <AudioComponent
                key={info.trackPublication.trackSid}
                track={info.trackPublication.audioTrack}
              />
            ),
          )}
        </section>
  
        {/* 채팅 */}
        <section className="chat">
          <ul>
            {chatLog.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
          <form onSubmit={sendChat}>
            <input ref={chatInput} placeholder="메시지 입력…" />
            <button type="submit">Send</button>
          </form>
        </section>
      </div>
    );
  }
  