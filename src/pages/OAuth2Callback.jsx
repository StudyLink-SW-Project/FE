import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function OAuth2Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUserInfo } = useAuth();

  // useEffect(() => {
  //   // 로그인 성공 후 사용자 정보 가져오기
  //   const getUserInfo = async () => {
  //     const success = await fetchUserInfo();
  //     // 홈으로 리다이렉트
  //     navigate(success ? '/' : '/login');
  //   };

  //   getUserInfo();
  // }, [fetchUserInfo, navigate]);

    useEffect(() => {
    // 소셜 로그인 후 백엔드가 토큰을 쿠키로 내려주고,
    // 프론트엔드에서는 별도 fetch 없이 바로 홈으로 이동
    navigate('/');
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-xl">로그인 처리 중입니다...</div>
    </div>
  );
}
