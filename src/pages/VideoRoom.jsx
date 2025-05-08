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

export default function VideoRoom() {
  const [room, setRoom] = useState();              // Room 인스턴스
  const [localTrack, setLocalTrack] = useState();  // 내 카메라 트랙
  const [remoteTracks, setRemoteTracks] = useState([]); // 원격 트랙들

  const [participantName, setParticipantName] = useState(
    `Participant${Math.floor(Math.random() * 100)}`
  );
  const [roomName, setRoomName] = useState("Test Room");

  const subscribedRef   = useRef();
  const unsubscribedRef = useRef();

  useEffect(() => {
    return () => room?.disconnect();
  }, [room]);

  async function joinRoom() {
    const r = new Room();
    setRoom(r);

    // 1) 원격 트랙 구독 이벤트
    subscribedRef.current = (track, publication, participant) => {
      setRemoteTracks(prev => [
        ...prev,
        { trackPublication: publication, participantIdentity: participant.identity }
      ]);
    };
    r.on(RoomEvent.TrackSubscribed, subscribedRef.current);

    // 2) 원격 트랙 제거 이벤트
    unsubscribedRef.current = (_, publication) => {
      setRemoteTracks(prev =>
        prev.filter(t => t.trackPublication.trackSid !== publication.trackSid)
      );
    };
    r.on(RoomEvent.TrackUnsubscribed, unsubscribedRef.current);

    try {
      // 3) 토큰 발급 → 룸 연결
      const token = await getToken(roomName, participantName);
      await r.connect(LIVEKIT_URL, token);

      // 4) 카메라·마이크 퍼블리시
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

  /**
   * 토큰 발급
   * @param {string} roomName
   * @param {string} participantName
   */
  async function getToken(roomName, participantName) {
    const res = await fetch(
      // .env.production 에 설정된 VITE_APP_SERVER를 기반으로 호출
      `${APPLICATION_SERVER_URL}api/v1/video/token`,
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
