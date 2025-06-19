// src/pages/SignupPage.jsx
import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupThunk } from "../store/authThunks";
import { useTheme } from "../contexts/ThemeContext";

export default function SignupPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const { isDark } = useTheme();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      // 비밀번호 불일치 처리
      return;
    }
    try {
      await dispatch(signupThunk({ email, name, password })).unwrap();
      navigate("/login", { state: { message: "회원가입이 완료되었습니다. 로그인해주세요." } });
    } catch (err) {
      console.error("회원가입 오류:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 왼쪽: 회원가입 폼 (모바일에서는 전체 화면) */}
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
            <img
              src={isDark ? '/logo_white.png' : '/logo_black.png'}
              alt="logo"
              className="w-20 sm:w-24"
            />
          </Link>
        </div>

        {/* 중앙 정렬된 폼 */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">회원가입</h1>
            <p className="text-sm text-gray-500 mb-8 sm:mb-15">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-blue-600 underline">여기</Link>를 클릭해 로그인하세요!
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6 sm:space-y-7">
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
                <label className="text-sm text-gray-600 mb-1">이름</label>
                <div className="flex items-center border-b border-gray-400 pb-1">
                  <User className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="이름을 입력하세요"
                    className="w-full py-2 outline-none text-sm sm:text-base"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1">비밀번호</label>
                <div className="flex items-center border-b border-gray-400 pb-1">
                  <Lock className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
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

              <div>
                <label className="text-sm text-gray-600 mb-1">비밀번호 확인</label>
                <div className="flex items-center border-b border-gray-400 pb-1">
                  <Lock className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="비밀번호를 한 번 더 입력하세요"
                    className="w-full py-2 outline-none text-sm sm:text-base"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(prev => !prev)}>
                    {showConfirm ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="cursor-pointer w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 sm:pt-8">
                <button
                  type="submit"
                  className="cursor-pointer w-full bg-[#1D1F2C] text-white py-3 rounded-full hover:bg-gray-800 transition text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? "처리 중..." : "회원가입"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 오른쪽: 일러스트 (데스크탑만 표시) */}
      <div className={`
        ${isDark 
          ? 'bg-gradient-to-br from-[#000217] via-[#4F4EB2] to-purple-200 text-white' 
          : 'bg-gradient-to-br  via-indigo-100 from-blue-500 to-purple-100 text-gray-700'
        }
        hidden lg:flex lg:w-1/2 flex-col items-center justify-center
      `}>
        <img src="/Saly.png" alt="illustration" className="w-[60%] max-w-sm" />
        <h2 className="text-4xl mt-8 font-semibold text-center px-4">Study Link에 가입하세요</h2>
        <p className="text-base mt-2 text-center px-4">지금 바로 스터디를 시작해보세요</p>
      </div>
    </div>
  );
}