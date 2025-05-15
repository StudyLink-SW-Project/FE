// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useSelector(state => state.auth);
  const location = useLocation();  // 현재 경로 정보를 가져옵니다.

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        로딩 중...
      </div>
    );
  }

  if (!user) {
    // 로그인하지 않았다면 로그인 페이지로 이동하며,
    // state.from에 원래 접근하려던 경로를 저장합니다.
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
