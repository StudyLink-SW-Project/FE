// src/pages/LoginPage.jsx
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk, fetchInfoThunk } from "../store/authThunks";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";  // 원래 경로 또는 "/" 디폴트

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginThunk({ email, password })).unwrap();
      await dispatch(fetchInfoThunk()).unwrap();
      // 로그인 성공 시, 원래 가려던 경로로 이동
      navigate(from, { replace: true });
    } catch (err) {
      console.error("로그인 오류:", err);
      toast.error('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleSocialLogin = (provider) => {
      window.location.href = `https://api.studylink.store/oauth2/authorization/${provider}`;
  };

  return (
    <div className="flex h-screen">
      {/* 왼쪽: 로그인 폼 */}
      <div className="w-1/2 flex flex-col justify-center items-center px-16 relative">

        <Link to="/">
          <img src="/logo_black.png" alt="logo" className="absolute top-2 left-2 w-24" />
        </Link>
        <div className="w-full max-w-sm">
        {/* 버튼과 제목을 같은 줄에 배치 */}
          <div className="flex items-center mb-2">
            <button
              onClick={() => navigate("/")}
              className="p-2 focus:outline-none"
            >
              <ArrowLeft className="cursor-pointer w-6 h-6 text-gray-600 hover:text-gray-800 -ml-20" />
            </button>
            <h1 className="text-3xl font-bold -ml-4">로그인</h1>
          </div>
          <p className="text-sm text-gray-500 mb-15">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-blue-600 underline">여기</Link>를 클릭해 회원가입하세요!
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <label className="text-sm text-gray-600 mb-1">이메일</label>
            <div className="flex items-center border-b border-gray-400 mb-7">
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="이메일 주소를 입력하세요.."
                className="w-full py-2 outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <label className="text-sm text-gray-600 mb-1">비밀번호</label>
            <div className="flex items-center border-b border-gray-400 mb-7">
              <Lock className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요.."
                className="w-full py-2 outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPwd(prev => !prev)}>
                {showPwd ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="cursor-pointer w-4 h-4 text-gray-400" />}
              </button>
            </div>

            <div className="flex justify-between text-xs text-gray-500 mb-15">
              {/* <label className="flex items-center gap-1">
                <input type="checkbox" /> 유지하기
              </label> */}
              <span>비밀번호를 잊으셨나요?</span>
            </div>

            <button
              type="submit"
              className="cursor-pointer w-full bg-[#1D1F2C] text-white py-3 rounded-full hover:bg-gray-800 transition"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">또는 다음으로 진행하기</p>
          <div className="flex justify-center gap-7 mt-8">
            <button onClick={() => handleSocialLogin('google')}>
              <img src="/google_icon.png" alt="Google 로그인" className="cursor-pointer w-10 h-10" />
            </button>
            <button onClick={() => handleSocialLogin('kakao')}>
              <img src="/kakaotalk_icon.png" alt="카카오 로그인" className="cursor-pointer w-10 h-10" />
            </button>
            <button onClick={() => handleSocialLogin('naver')}>
              <img src="/naver_icon.png" alt="네이버 로그인" className="cursor-pointer w-10 h-10" />
            </button>
          </div>
        </div>
      </div>
      <div className="w-1/2 bg-[linear-gradient(to_bottom,#1D1F2C,#000E76,#7A8AF4)] text-white flex flex-col items-center justify-center">
        <img src="/Saly.png" alt="illustration" className="w-[60%]" />
        <h2 className="text-4xl mt-8 font-semibold">Study Link에 로그인하세요</h2>
        <p className="text-sm mt-2">쉽고 빠르게, 스터디를 연결해보세요</p>
      </div>
    </div>
  );
}
