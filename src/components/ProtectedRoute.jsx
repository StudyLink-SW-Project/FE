import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useSelector(state => state.auth);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
