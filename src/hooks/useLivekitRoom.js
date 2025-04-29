// hooks/useLivekitRoom.js
import {
    Room, Track, RoomEvent,
    LocalVideoTrack, RemoteTrackPublication,
    DataPacket_Kind,
  } from 'livekit-client';
  import { useState, useEffect, useRef } from 'react';
  
  export default function useLivekitRoom(serverUrl, token) {
    const [room, setRoom] = useState();
    const [localTrack, setLocalTrack] = useState();
    const [remoteTracks, setRemoteTracks] = useState([]);
    const [chatLog, setChatLog] = useState([]);
  
    /* 1)  룸 연결 */
    useEffect(() => {
      if (!token) return;
      const r = new Room();
      setRoom(r);
  
      const onSub = (_t, pub, p) =>
        setRemoteTracks(v => [...v, { pub, id: p.identity }]);
  
      const onUnsub = (_t, pub) =>
        setRemoteTracks(v => v.filter(t => t.pub.trackSid !== pub.trackSid));
  
      const onData = (buf, p) =>
        setChatLog(v => [...v, `${p.identity}: ${new TextDecoder().decode(buf)}`]);
  
      r.on(RoomEvent.TrackSubscribed, onSub)
        .on(RoomEvent.TrackUnsubscribed, onUnsub)
        .on(RoomEvent.DataReceived, onData);
  
      (async () => {
        await r.connect(serverUrl, token);
        await r.localParticipant.enableCameraAndMicrophone();
        const first = r.localParticipant.videoTrackPublications.values().next().value;
        setLocalTrack(first?.videoTrack);
      })();
  
      return () => r.disconnect();
    }, [token, serverUrl]);
  
    /* 2)  편의 함수 */
    const toggleMic = () =>
      room?.localParticipant.setMicrophoneEnabled(!room.localParticipant.isMicrophoneEnabled);
    const toggleCam = () =>
      room?.localParticipant.setCameraEnabled(!room.localParticipant.isCameraEnabled);
    const sendChat = txt =>
      room?.localParticipant.publishData(new TextEncoder().encode(txt), DataPacket_Kind.RELIABLE);
  
    return { room, localTrack, remoteTracks, chatLog, toggleMic, toggleCam, sendChat };
  }
  