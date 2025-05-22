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


  // 토큰 발급 서버
  let APPLICATION_SERVER_URL = "https://api.studylink.store/";
  // LiveKit WebSocket URL
  let LIVEKIT_URL = ""; 

    // If LIVEKIT_URL is not configured, use default value from OpenVidu Local deployment
    if (!LIVEKIT_URL) {
        if (window.location.hostname === "localhost") {
            LIVEKIT_URL = "ws://localhost:7880/";
        } else {
            LIVEKIT_URL = "wss://" + window.location.hostname;
        }
    }

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
    return () => {
      // 컴포넌트 언마운트 시 연결 해제
      room?.disconnect();
    };
  }, [room]);

  async function joinRoom() {
    console.log("joinRoom 함수 시작");
    const r = new Room();
    console.log("Room 인스턴스 생성:", r);
    setRoom(r);


  // Room 객체 생성 후 이벤트 리스너 추가 (여기에 추가)
  r.on(RoomEvent.Connected, () => console.log("WebSocket 연결됨"));
  r.on(RoomEvent.Disconnected, (reason) => console.log("WebSocket 연결 해제됨:", reason));
  r.on(RoomEvent.ConnectionStateChanged, (state) => console.log("WebSocket 상태 변경:", state));
  r.on(RoomEvent.ConnectionQualityChanged, (connectionQuality) => console.log("연결 품질 변경:", connectionQuality));
  r.on(RoomEvent.SignalConnected, () => console.log("시그널링 서버 연결됨"));
  r.on(RoomEvent.SignalConnectionStateChanged, (state) => console.log("시그널링 상태 변경:", state));
  r.on(RoomEvent.Reconnecting, () => console.log("재연결 시도 중"));
  r.on(RoomEvent.Reconnected, () => console.log("재연결 성공"));



  // 1) 원격 트랙 구독 이벤트
  subscribedRef.current = (track, publication, participant) => {
    console.log("TrackSubscribed 이벤트:", { track, publication, participant });
    setRemoteTracks(prev => [
      ...prev,
      { trackPublication: publication, participantIdentity: participant.identity }
    ]);
  };
  r.on(RoomEvent.TrackSubscribed, subscribedRef.current);

  // 2) 원격 트랙 제거 이벤트
  unsubscribedRef.current = (_, publication) => {
    console.log("TrackUnsubscribed 이벤트:", publication);
    setRemoteTracks(prev =>
      prev.filter(t => t.trackPublication.trackSid !== publication.trackSid)
    );
  };
  r.on(RoomEvent.TrackUnsubscribed, unsubscribedRef.current);

  try {
    // 3) 토큰 발급 → 룸 연결
    console.log("토큰 발급 시작:", { roomName, participantName });
    const token = await getToken(roomName, participantName);
    console.log("토큰 발급 완료:", token);
    
    console.log("LiveKit 서버 연결 시작:", { LIVEKIT_URL });
    await r.connect(LIVEKIT_URL, token);
    console.log("LiveKit 서버 연결 완료");

    // 4) 카메라·마이크 퍼블리시
    console.log("카메라/마이크 활성화 시작");
    await r.localParticipant.enableCameraAndMicrophone();
    console.log("카메라/마이크 활성화 완료");
    
    const pubIter = r.localParticipant.videoTrackPublications.values();
    const videoTrack = pubIter.next().value?.videoTrack;
    console.log("로컬 비디오 트랙:", videoTrack);
    setLocalTrack(videoTrack);
  } catch (err) {
    console.error("룸 연결 중 오류:", err);
    console.log("오류 상세 정보:", { 
      message: err.message,
      name: err.name,
      stack: err.stack,
      cause: err.cause
    });
    await leaveRoom();
  }
}

  async function leaveRoom() {
    if (!room) return;
    // 이벤트 리스너 정리
    room.off(RoomEvent.TrackSubscribed,   subscribedRef.current);
    room.off(RoomEvent.TrackUnsubscribed, unsubscribedRef.current);
    await room.disconnect();
    setRoom(undefined);
    setLocalTrack(undefined);
    setRemoteTracks([]);
  }

  async function getToken(roomName, participantName) {
    console.log("getToken 함수 호출:", { roomName, participantName, url: `${APPLICATION_SERVER_URL}api/v1/video/token` });
    
    try {
      const res = await fetch(
        `${APPLICATION_SERVER_URL}api/v1/video/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName, participantName }),
        }
      );
      
      console.log("토큰 요청 응답:", { status: res.status, ok: res.ok });
      
      if (!res.ok) {
        const err = await res.json();
        console.error("토큰 발급 실패 응답:", err);
        throw new Error(`토큰 발급 실패: ${err.errorMessage}`);
      }
      
      const data = await res.json();
      console.log("토큰 발급 성공:", data);
      return data.token;
    } catch (error) {
      console.error("토큰 요청 중 예외 발생:", error);
      throw error;
    }
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
