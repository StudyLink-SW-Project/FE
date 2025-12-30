// src/pages/OAuth2Callback.jsx
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { fetchInfoThunk } from '../store/authThunks';

export default function OAuth2Callback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // OAuth2 성공 시 백엔드에서 이미 쿠키 설정 완료
    // 사용자 정보를 가져와서 Redux에 저장 후 홈으로 이동
    const handleOAuthSuccess = async () => {
      try {
        // 사용자 정보 조회 (쿠키의 토큰 사용)
        await dispatch(fetchInfoThunk()).unwrap();
        // 성공 시 홈으로 이동
        navigate('/', { replace: true });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('OAuth2 로그인 후 사용자 정보 조회 실패:', error);
        }
        // 실패 시 로그인 페이지로
        navigate('/login', { replace: true });
      }
    };

    // 약간의 지연 후 처리 (백엔드 쿠키 설정 완료 대기)
    setTimeout(handleOAuthSuccess, 500);
  }, [navigate, dispatch]);

  return (
    <div className="flex items-center justify-center h-screen text-white bg-[#1D1F2C]">
      로그인 처리 중...
    </div>
  );
}