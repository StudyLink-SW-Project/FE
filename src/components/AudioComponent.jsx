// AudioComponent.jsx
import { LocalAudioTrack, RemoteAudioTrack } from 'livekit-client';
import { useEffect, useRef } from 'react';

/**
 * @param {{ track: LocalAudioTrack | RemoteAudioTrack }} props
 */
function AudioComponent({ track }) {
  const audioRef = useRef(null);          // HTMLAudioElement를 담을 ref

  useEffect(() => {
    if (audioRef.current) {
      track.attach(audioRef.current);     // 오디오 트랙 <audio>에 연결
    }
    return () => {
      track.detach();                     // 컴포넌트 언마운트 시 분리
    };
  }, [track]);

  return <audio ref={audioRef} id={track.sid} />;
}

export default AudioComponent;
