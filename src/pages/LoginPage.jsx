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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 왼쪽: 로그인 폼 */}
      <div className="w-full lg:w-1/2 flex flex-col px-4 sm:px-8 lg:px-16 py-8 lg:py-0 relative">
        
        {/* 상단 헤더: 로고 + 뒤로가기 */}
        <div className="flex items-center justify-between mb-8 lg:mb-12">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="cursor-pointer w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-gray-800" />
          </button>
          <Link to="/">
            <img src="/logo_black.png" alt="logo" className="w-20 sm:w-24" />
          </Link>
        </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="w-full max-w-sm">
          {/* 버튼과 제목을 같은 줄에 배치 */}
          <div className="flex items-center mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold ml-2">로그인</h1>
          </div>
          <p className="text-sm text-gray-500 mb-8 sm:mb-15">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-blue-600 underline">여기</Link>를 클릭해 회원가입하세요!
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6 sm:space-y-7">
            <div>
              <label className="text-sm text-gray-600 mb-1">이메일</label>
              <div className="flex items-center border-b border-gray-400 pb-1">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="email"
                  placeholder="이메일 주소를 입력하세요.."
                  className="w-full py-2 outline-none text-sm sm:text-base"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1">비밀번호</label>
              <div className="flex items-center border-b border-gray-400 pb-1">
                <Lock className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요.."
                  className="w-full py-2 outline-none text-sm sm:text-base"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPwd(prev => !prev)}>
                  {showPwd ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="cursor-pointer w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end text-xs text-gray-500 mb-8 sm:mb-15">
              <span>비밀번호를 잊으셨나요?</span>
            </div>

            <button
              type="submit"
              className="cursor-pointer w-full bg-[#1D1F2C] text-white py-3 rounded-full hover:bg-gray-800 transition text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6 sm:mt-8">또는 다음으로 진행하기</p>
          <div className="flex justify-center gap-6 sm:gap-7 mt-6 sm:mt-8">
            <button onClick={() => handleSocialLogin('google')}>
              <img src="/google_icon.png" alt="Google 로그인" className="cursor-pointer w-9 h-9 sm:w-10 sm:h-10" />
            </button>
            <button onClick={() => handleSocialLogin('kakao')}>
              <img src="/kakaotalk_icon.png" alt="카카오 로그인" className="cursor-pointer w-9 h-9 sm:w-10 sm:h-10" />
            </button>
            <button onClick={() => handleSocialLogin('naver')}>
              <img src="/naver_icon.png" alt="네이버 로그인" className="cursor-pointer w-9 h-9 sm:w-10 sm:h-10" />
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* 오른쪽: 일러스트 (데스크탑만 표시) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[linear-gradient(to_bottom,#1D1F2C,#000E76,#7A8AF4)] text-white flex-col items-center justify-center">
        <img src="/Saly.png" alt="illustration" className="w-[60%] max-w-sm" />
        <h2 className="text-4xl mt-8 font-semibold text-center px-4">Study Link에 로그인하세요</h2>
        <p className="text-base mt-2 text-center px-4">쉽고 빠르게, 스터디를 연결해보세요</p>
      </div>
    </div>
  );
}