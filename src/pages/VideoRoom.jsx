import React, { useState, useEffect, useRef } from "react";
import {
  Room,
  RoomEvent,
  ParticipantEvent,
} from "livekit-client";
import "../App.css";
import VideoComponent from "../components/VideoComponent";
import AudioComponent from "../components/AudioComponent";

// ── 유틸: URL 끝 슬래시 제거 ──
function trimSlash(url) {
  return url.replace(/\/+$/, "");
}

// 환경 변수에서 서버 URL 가져오기
const APPLICATION_SERVER_BASE = trimSlash(
  import.meta.env.VITE_APP_SERVER || "http://localhost:6080"
);
const LIVEKIT_WS_URL = trimSlash(
  import.meta.env.VITE_LIVEKIT_URL || "ws://localhost:7880"
);

export default function VideoRoom() {
  const [room, setRoom] = useState/** @type {Room|undefined} */();
  const [localTrack, setLocalTrack] = useState/** @type {import('livekit-client').LocalVideoTrack|undefined} */();
  const [remoteTracks, setRemoteTracks] = useState/** @type {TrackInfo[]} */([]);

  const [participantName, setParticipantName] = useState(
    `Participant${Math.floor(Math.random() * 100)}`
  );
  const [roomName, setRoomName] = useState("Test Room");

  // 이벤트 핸들러 레퍼런스 (cleanup 용)
  const handleSubscribedRef = useRef();
  const handleUnsubscribedRef = useRef();
  const handleLocalPublishedRef = useRef();

  // 컴포넌트 언마운트 시 리소스 정리
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  async function joinRoom() {
    const r = new Room();

    // 구독된 트랙 처리
    const handleSubscribed = (track, publication, participant) => {
      setRemoteTracks((prev) => [
        ...prev,
        {
          trackPublication: publication,
          participantIdentity: participant.identity,
        },
      ]);
    };
    handleSubscribedRef.current = handleSubscribed;
    r.on(RoomEvent.TrackSubscribed, handleSubscribed);

    // 구독 해제된 트랙 처리
    const handleUnsubscribed = (_track, publication) => {
      setRemoteTracks((prev) =>
        prev.filter((t) => t.trackPublication.trackSid !== publication.trackSid)
      );
    };
    handleUnsubscribedRef.current = handleUnsubscribed;
    r.on(RoomEvent.TrackUnsubscribed, handleUnsubscribed);

    // 로컬 비디오 트랙 퍼블리시 감지
    const handleLocalPublished = (publication) => {
      if (publication.track && publication.kind === "video") {
        setLocalTrack(publication.track);
      }
    };
    handleLocalPublishedRef.current = handleLocalPublished;
    r.localParticipant.on(
      ParticipantEvent.LocalTrackPublished,
      handleLocalPublished
    );

    setRoom(r);

    try {
      // 토큰 발급
      const token = await getToken(roomName, participantName);
      // LiveKit 룸 연결
      await r.connect(LIVEKIT_WS_URL, token);
      // 카메라·마이크 활성화
      await r.localParticipant.enableCameraAndMicrophone();
    } catch (e) {
      console.error("룸 연결 중 오류:", e);
      await leaveRoom();
    }
  }

  async function leaveRoom() {
    if (!room) return;
    // 이벤트 리스너 정리
    room.off(RoomEvent.TrackSubscribed, handleSubscribedRef.current);
    room.off(RoomEvent.TrackUnsubscribed, handleUnsubscribedRef.current);
    room.localParticipant.off(
      ParticipantEvent.LocalTrackPublished,
      handleLocalPublishedRef.current
    );
    // 룸 연결 해제
    await room.disconnect();
    // 상태 초기화
    setRoom(undefined);
    setLocalTrack(undefined);
    setRemoteTracks([]);
  }

  async function getToken(roomName, participantName) {
    const url = `${APPLICATION_SERVER_BASE}/api/v1/video/token`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName, participantName }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`토큰 발급 실패: ${err.errorMessage}`);
    }
    const { token } = await res.json();
    return token;
  }

  return !room ? (
    <div id="join">
      <div id="join-dialog">
        <h2>Join a Video Room</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            joinRoom();
          }}
        >
          <label>
            Participant
            <input
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              required
            />
          </label>
          <label>
            Room
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </label>
          <button disabled={!participantName || !roomName}>Join!</button>
        </form>
      </div>
    </div>
  ) : (
    <div id="room">
      <header>
        <h2>{roomName}</h2>
        <button onClick={leaveRoom}>Leave</button>
      </header>
      <section id="layout-container">
        {localTrack && (
          <VideoComponent
            track={localTrack}
            participantIdentity={participantName}
            local
          />
        )}
        {remoteTracks.map((info) =>
          info.trackPublication.kind === "video" ? (
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
          )
        )}
      </section>
    </div>
  );
}
