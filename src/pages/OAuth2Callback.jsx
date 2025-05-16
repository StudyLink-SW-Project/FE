// src/pages/OAuth2Callback.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export default function OAuth2Callback() {
  const { provider } = useParams();            // "kakao" 등
  const { search } = useLocation();            // ?code=…&state=…
  const navigate = useNavigate();
  const base = import.meta.env.DEV
    ? 'http://localhost:8081/'
    : (import.meta.env.VITE_APP_SERVER || 'https://api.studylink.store/');

  useEffect(() => {
    // 1) 서버에 code, state 넘겨서 세션/토큰 교환
    fetch(`${base}oauth2/login/${provider}${search}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => {
        if (res.ok) {
          // 2) 토큰 성공 시 홈으로
          navigate('/', { replace: true });
        } else {
          // 3) 실패 시 로그인 페이지로
          navigate('/login', { replace: true });
        }
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  }, []);

  //  로딩 화면
  return (
    <div className="flex items-center justify-center h-screen text-white bg-[#1D1F2C]">
      로그인 처리 중...
    </div>
  );
}
