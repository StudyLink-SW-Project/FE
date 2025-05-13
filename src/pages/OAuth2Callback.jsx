import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchInfoThunk } from '../store/authThunks';

export default function OAuth2Callback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    async function handleCallback() {
      try {
        // 소셜 로그인 콜백 후 사용자 정보 가져오기
        await dispatch(fetchInfoThunk()).unwrap();
        navigate('/');
      } catch {
        navigate('/login');
      }
    }
    handleCallback();
  }, [dispatch, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-xl">로그인 처리 중입니다...</div>
    </div>
  );
}
