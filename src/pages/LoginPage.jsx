import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, getSocialLoginUrl } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate("/");
      } else {
        setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialLogin = (provider) => {
    window.location.href = getSocialLoginUrl(provider);
  };

  return (
    <div className="flex h-screen">
      {/* 왼쪽: 로그인 폼 */}
      <div className="w-1/2 flex flex-col justify-center items-center px-16 relative">
        {/* 왼쪽 상단 로고 */}
        <Link to="/">
          <img src="/logo_black.png" alt="logo" className="absolute top-2 left-2 w-24" />
        </Link>

        {/* 입력 폼 박스 */}
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-2">로그인</h1>
          <p className="text-sm text-gray-500 mb-15">
            계정이 없으신가요?{" "}
            <Link to="/signup" className="text-purple-600 underline">여기</Link>를 클릭해 회원가입하세요!
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* 이메일 */}
            <label className="text-sm text-gray-600 mb-1">이메일</label>
            <div className="flex items-center border-b border-gray-400 mb-7">
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="이메일 주소를 입력하세요.."
                className="w-full py-2 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* 비밀번호 */}
            <label className="text-sm text-gray-600 mb-1">비밀번호</label>
            <div className="flex items-center border-b border-gray-400 mb-7">
              <Lock className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="비밀번호를 입력하세요.."
                className="w-full py-2 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>

            {/* 로그인 유지 및 비밀번호 찾기 */}
            <div className="flex justify-between text-xs text-gray-500 mb-15">
              <label className="flex items-center gap-1">
                <input type="checkbox" />
                로그인 유지
              </label>
              <span>비밀번호를 잊으셨나요?</span>
            </div>

            {/* 로그인 버튼 */}
            <button 
              type="submit" 
              className="w-full bg-[#1D1F2C] text-white py-3 rounded-full hover:bg-gray-800 transition"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          {/* 소셜 로그인 */}
          <p className="text-center text-gray-400 text-sm mt-8">
            또는 다음으로 진행하기
          </p>
          <div className="flex justify-center gap-7 mt-8">
            <button type="button" onClick={() => handleSocialLogin("google")}>
              <img src="/google_icon.png" alt="Google 로그인" className="w-10 h-10" />
            </button>
            <button type="button" onClick={() => handleSocialLogin("kakao")}>
              <img src="/kakaotalk_icon.png" alt="카카오 로그인" className="w-10 h-10" />
            </button>
            <button type="button" onClick={() => handleSocialLogin("naver")}>
              <img src="/naver_icon.png" alt="네이버 로그인" className="w-10 h-10" />
            </button>
          </div>
        </div>
      </div>

      {/* 오른쪽 일러스트 영역 */}
      <div className="w-1/2 bg-[linear-gradient(to_bottom,#1D1F2C,#000E76,#7A8AF4)] text-white flex flex-col items-center justify-center rounded-l-3xl">
        <img src="/Saly.png" alt="illustration" className="w-[60%]" />
        <h2 className="text-4xl mt-8 font-semibold">Study Link에 로그인하세요</h2>
        <p className="text-sm mt-2">쉽고 빠르게, 스터디를 연결해보세요</p>
      </div>
    </div>
  );
}