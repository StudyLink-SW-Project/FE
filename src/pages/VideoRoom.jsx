import React, { useState, useEffect, useRef } from "react";
import {
  Room,
  RoomEvent,
  ParticipantEvent,
} from "livekit-client";
import "../App.css";
import VideoComponent from "../components/VideoComponent";
import AudioComponent from "../components/AudioComponent";

// ── URL 자동 설정 함수 (OpenVidu 튜토리얼 기반) ──
function configureUrls() {
  const hostname = window.location.hostname;
  let appUrl = import.meta.env.VITE_APP_SERVER;
  let liveKitUrl = import.meta.env.VITE_LIVEKIT_URL;

  // 애플리케이션 서버 URL 설정
  if (!appUrl) {
    if (hostname === "localhost") {
      appUrl = "http://localhost:6080";
    } else {
      appUrl = `https://${hostname}:6443`;
    }
  }

  // LiveKit WebSocket URL 설정
  if (!liveKitUrl) {
    if (hostname === "localhost") {
      liveKitUrl = "ws://localhost:7880";
    } else {
      liveKitUrl = `wss://${hostname}:7443`;
    }
  }

  // 끝 슬래시 제거
  appUrl = appUrl.replace(/\/+$/, "");
  liveKitUrl = liveKitUrl.replace(/\/+$/, "");

  return { appUrl, liveKitUrl };
}

const { appUrl: APPLICATION_SERVER_BASE, liveKitUrl: LIVEKIT_WS_URL } = configureUrls();

export default function VideoRoom() {
  const [room, setRoom] = useState/** @type {Room|undefined} */();
  const [localTrack, setLocalTrack] = useState/** @type {import('livekit-client').LocalVideoTrack|undefined} */();
  const [remoteTracks, setRemoteTracks] = useState/** @type {TrackInfo[]} */([]);

  const [participantName, setParticipantName] = useState(
    `Participant${Math.floor(Math.random() * 100)}`
  );
  const [roomName, setRoomName] = useState("Test Room");

  const handleSubscribedRef = useRef();
  const handleUnsubscribedRef = useRef();
  const handleLocalPublishedRef = useRef();

  // 컴포넌트 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  async function joinRoom() {
    const r = new Room();

    // 트랙 구독 핸들러 등록
    const handleSubscribed = (track, publication, participant) => {
      setRemoteTracks((prev) => [
        ...prev,
        { trackPublication: publication, participantIdentity: participant.identity },
      ]);
    };
    handleSubscribedRef.current = handleSubscribed;
    r.on(RoomEvent.TrackSubscribed, handleSubscribed);

    const handleUnsubscribed = (_track, publication) => {
      setRemoteTracks((prev) =>
        prev.filter((t) => t.trackPublication.trackSid !== publication.trackSid)
      );
    };
    handleUnsubscribedRef.current = handleUnsubscribed;
    r.on(RoomEvent.TrackUnsubscribed, handleUnsubscribed);

    const handleLocalPublished = (publication) => {
      if (publication.track && publication.kind === "video") {
        setLocalTrack(publication.track);
      }
    };
    handleLocalPublishedRef.current = handleLocalPublished;
    r.localParticipant.on(ParticipantEvent.LocalTrackPublished, handleLocalPublished);

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
    room.localParticipant.off(ParticipantEvent.LocalTrackPublished, handleLocalPublishedRef.current);
    await room.disconnect();
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
        <form onSubmit={(e) => { e.preventDefault(); joinRoom(); }}>
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
          <VideoComponent track={localTrack} participantIdentity={participantName} local />
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
