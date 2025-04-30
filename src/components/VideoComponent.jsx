// VideoComponent.jsx
import { LocalVideoTrack, RemoteVideoTrack } from 'livekit-client';
import './VideoComponent.css';
import { useEffect, useRef } from 'react';

/**
 * @param {{
 *   track: LocalVideoTrack | RemoteVideoTrack,
 *   participantIdentity: string,
 *   local?: boolean
 * }} props
 */
function VideoComponent({ track, participantIdentity, local = false }) {
  const videoRef = useRef(null);   // HTMLVideoElement

  useEffect(() => {
    if (videoRef.current) {
      track.attach(videoRef.current);   // 비디오 트랙 연결
    }
    return () => {
      track.detach();                   // 언마운트 시 분리
    };
  }, [track]);

  return (
    <div id={`camera-${participantIdentity}`} className="video-container">
      <div className="participant-data">
        <p>{participantIdentity + (local ? ' (You)' : '')}</p>
      </div>
      <video ref={videoRef} id={track.sid} />
    </div>
  );
}

export default VideoComponent;
