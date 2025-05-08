// src/pages/VideoRoom.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  LocalVideoTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
} from "livekit-client";
import "../App.css";
import VideoComponent from "../components/VideoComponent";
import AudioComponent from "../components/AudioComponent";

/**
 * @typedef {Object} TrackInfo
 * @property {RemoteTrackPublication} trackPublication - 트랙 메타데이터 + 접근자
 * @property {string} participantIdentity - 참가자 ID(이름)
 */

// .env 변수로 설정된 서버 URL
const APPLICATION_SERVER_URL = import.meta.env.VITE_APP_SERVER;
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

export default function VideoRoom({ tokenFromModal, id }) {
  const [room, setRoom] = useState();
  const [localTrack, setLocalTrack] = useState();
  const [remoteTracks, setRemoteTracks] = useState([]);

  const [participantName, setParticipantName] = useState(
    `Participant${Math.floor(Math.random() * 100)}`
  );

  const subscribedRef   = useRef();
  const unsubscribedRef = useRef();

  useEffect(() => {
    return () => room?.disconnect();
  }, [room]);

  async function joinRoom() {
    const r = new Room();
    setRoom(r);

    // 원격 트랙 구독
    subscribedRef.current = (track, publication, participant) => {
      setRemoteTracks(prev => [
        ...prev,
        { trackPublication: publication, participantIdentity: participant.identity }
      ]);
    };
    r.on(RoomEvent.TrackSubscribed, subscribedRef.current);

    // 원격 트랙 구독 해제
    unsubscribedRef.current = (_, publication) => {
      setRemoteTracks(prev =>
        prev.filter(t => t.trackPublication.trackSid !== publication.trackSid)
      );
    };
    r.on(RoomEvent.TrackUnsubscribed, unsubscribedRef.current);

    try {
      // 모달에서 받은 토큰 우선 사용, 없으면 백엔드 호출
      const livekitToken = tokenFromModal ?? await (async () => {
        const res = await fetch(
          `${APPLICATION_SERVER_URL}/api/v1/video/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomName: id, participantName }),
          }
        );
        if (!res.ok) throw new Error("토큰 서버 오류");
        const { token } = await res.json();
        return token;
      })();

      // 룸 연결
      await r.connect(LIVEKIT_URL, livekitToken);

      // 카메라·마이크 퍼블리시 및 로컬 트랙 설정
      await r.localParticipant.enableCameraAndMicrophone();
      const pubIter = r.localParticipant.videoTrackPublications.values();
      setLocalTrack(pubIter.next().value.videoTrack);
    } catch (err) {
      console.error("룸 연결 중 오류:", err);
      await leaveRoom();
    }
  }

  async function leaveRoom() {
    if (!room) return;
    room.off(RoomEvent.TrackSubscribed,   subscribedRef.current);
    room.off(RoomEvent.TrackUnsubscribed, unsubscribedRef.current);
    await room.disconnect();
    setRoom(undefined);
    setLocalTrack(undefined);
    setRemoteTracks([]);
  }

  return (
    <>
      {!room ? (
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
              <button disabled={!participantName}>Join!</button>
            </form>
          </div>
        </div>
      ) : (
        <div id="room">
          <header>
            <h2>{id}</h2>
            <button onClick={leaveRoom}>Leave Room</button>
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
      )}
    </>
  );
}
