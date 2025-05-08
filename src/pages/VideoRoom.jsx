import React, { useState, useEffect, useRef } from "react";
import { Room, RoomEvent, ParticipantEvent } from "livekit-client";
import "../App.css";
import VideoComponent from "../components/VideoComponent";
import AudioComponent from "../components/AudioComponent";

// JWT 디코딩 유틸 (라이브러리 불필요)
function decodeJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

// ── URL 자동 설정 함수 ──
function configureUrls() {
  const hostname = window.location.hostname;
  let appUrl = import.meta.env.VITE_APP_SERVER;
  let liveKitUrl = import.meta.env.VITE_LIVEKIT_URL;

  if (!appUrl) {
    appUrl = hostname === "localhost"
      ? "http://localhost:6080"
      : `https://${hostname}:6443`;
  }
  if (!liveKitUrl) {
    liveKitUrl = hostname === "localhost"
      ? "ws://localhost:7880"
      : `wss://${hostname}:7443`;
  }

  return {
    appUrl: appUrl.replace(/\/+$/, ""),
    liveKitUrl: liveKitUrl.replace(/\/+$/, ""),
  };
}

const { appUrl: APPLICATION_SERVER_BASE, liveKitUrl: LIVEKIT_WS_URL } = configureUrls();

export default function VideoRoom() {
  const [room, setRoom] = useState(null);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteTracks, setRemoteTracks] = useState([]);

  const [participantName, setParticipantName] = useState(
    `Participant${Math.floor(Math.random() * 100)}`
  );
  const [roomName, setRoomName] = useState("Test Room");

  const handleSubscribedRef = useRef(null);
  const handleUnsubscribedRef = useRef(null);
  const handleLocalPublishedRef = useRef(null);

  useEffect(() => {
    return () => {
      room?.disconnect();
    };
  }, [room]);

  async function joinRoom() {
    const r = new Room();

    handleSubscribedRef.current = (track, publication, participant) => {
      setRemoteTracks(prev => [
        ...prev,
        { trackPublication: publication, participantIdentity: participant.identity }
      ]);
    };
    r.on(RoomEvent.TrackSubscribed, handleSubscribedRef.current);

    handleUnsubscribedRef.current = (_track, publication) => {
      setRemoteTracks(prev =>
        prev.filter(t => t.trackPublication.trackSid !== publication.trackSid)
      );
    };
    r.on(RoomEvent.TrackUnsubscribed, handleUnsubscribedRef.current);

    handleLocalPublishedRef.current = (publication) => {
      if (publication.track && publication.kind === "video") {
        setLocalTrack(publication.track);
      }
    };
    r.localParticipant.on(
      ParticipantEvent.LocalTrackPublished,
      handleLocalPublishedRef.current
    );

    setRoom(r);

    try {
      // 최초 연결용 토큰 발급
      const initialToken = await getToken(roomName, participantName);
      await r.connect(LIVEKIT_WS_URL, initialToken);
      await r.localParticipant.enableCameraAndMicrophone();

      // 토큰 갱신 로직 (만료 5분 전)
      const { exp } = decodeJwt(initialToken);
      const now = Math.floor(Date.now() / 1000);
      const ttl = exp - now;
      const refreshDelay = (ttl - 300) * 1000;

      const refreshLoop = async () => {
        try {
          const newToken = await getToken(roomName, participantName);
          await r.updateToken(newToken);
          const { exp: newExp } = decodeJwt(newToken);
          const nextDelay = (newExp - Math.floor(Date.now() / 1000) - 300) * 1000;
          setTimeout(refreshLoop, nextDelay);
        } catch (err) {
          console.error("토큰 갱신 중 오류:", err);
        }
      };
      setTimeout(refreshLoop, refreshDelay);
    } catch (err) {
      console.error("룸 연결 중 오류:", err);
      leaveRoom();
    }
  }

  async function leaveRoom() {
    if (!room) return;
    room.off(RoomEvent.TrackSubscribed, handleSubscribedRef.current);
    room.off(RoomEvent.TrackUnsubscribed, handleUnsubscribedRef.current);
    room.localParticipant.off(
      ParticipantEvent.LocalTrackPublished,
      handleLocalPublishedRef.current
    );
    await room.disconnect();
    setRoom(null);
    setLocalTrack(null);
    setRemoteTracks([]);
  }

  async function getToken(roomName, participantName) {
    const res = await fetch(
      `${APPLICATION_SERVER_BASE}/api/v1/video/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, participantName }),
      }
    );
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
        <form onSubmit={e => { e.preventDefault(); joinRoom(); }}>
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
        {remoteTracks.map(info =>
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
