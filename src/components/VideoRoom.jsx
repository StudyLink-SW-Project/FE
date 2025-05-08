// src/pages/VideoRoom.jsx
import {
    LocalVideoTrack,
    RemoteParticipant,
    RemoteTrack,
    RemoteTrackPublication,
    Room,
    RoomEvent,
  } from "livekit-client";
  import "../App.css";
  import { useState } from "react";
  import VideoComponent from "../components/VideoComponent";
  import AudioComponent from "../components/AudioComponent";
  
  // ── 토큰 발급 서버 / LiveKit 서버 URL ──
  // .env.* 에 VITE_APP_SERVER, VITE_LIVEKIT_URL 로 설정해 두시면
  const APPLICATION_SERVER_URL =
    import.meta.env.VITE_APP_SERVER || "http://localhost:6080/";
  const LIVEKIT_URL =
    import.meta.env.VITE_LIVEKIT_URL || "ws://localhost:7880/";
  
  export default function VideoRoom() {
    const [room, setRoom] = useState/** @type {Room|undefined} */();
    const [localTrack, setLocalTrack] = useState/** @type {LocalVideoTrack|undefined} */();
    const [remoteTracks, setRemoteTracks] = useState/** @type {TrackInfo[]} */([]);
  
    const [participantName, setParticipantName] = useState(
      "Participant" + Math.floor(Math.random() * 100)
    );
    const [roomName, setRoomName] = useState("Test Room");
  
    async function joinRoom() {
      const r = new Room();
      setRoom(r);
  
      r.on(
        RoomEvent.TrackSubscribed,
        (_track, publication, participant) => {
          setRemoteTracks(prev => [
            ...prev,
            { trackPublication: publication, participantIdentity: participant.identity },
          ]);
        }
      );
      r.on(
        RoomEvent.TrackUnsubscribed,
        (_track, publication) => {
          setRemoteTracks(prev =>
            prev.filter(t => t.trackPublication.trackSid !== publication.trackSid)
          );
        }
      );
  
      try {
        // ③ 토큰 발급 → 룸 연결
        const token = await getToken(roomName, participantName);
        await r.connect(LIVEKIT_URL, token);
  
        // ④ 카메라·마이크 퍼블리시
        await r.localParticipant.enableCameraAndMicrophone();
        const pubIter = r.localParticipant.videoTrackPublications.values();
        setLocalTrack(pubIter.next().value.videoTrack);
      } catch (e) {
        console.error("룸 연결 중 오류:", e);
        await leaveRoom();
      }
    }
  
    async function leaveRoom() {
      await room?.disconnect();
      setRoom(undefined);
      setLocalTrack(undefined);
      setRemoteTracks([]);
    }
  
    async function getToken(roomName, participantName) {
      const res = await fetch(APPLICATION_SERVER_URL + "token", {
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
            onSubmit={e => {
              e.preventDefault();
              joinRoom();
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
      <div id="room">
        <header>
          <h2>{roomName}</h2>
          <button onClick={leaveRoom}>Leave</button>
        </header>
        <section id="layout-container">
          {localTrack && (
            <VideoComponent track={localTrack} participantIdentity={participantName} local />
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
  