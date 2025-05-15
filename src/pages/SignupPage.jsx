// src/pages/SignupPage.jsx
import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupThunk } from "../store/authThunks";

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
    <div className="flex h-screen">
      <div className="w-1/2 flex flex-col justify-center items-center px-16 relative">
        <Link to="/">
          <img src="/logo_black.png" alt="logo" className="absolute top-2 left-2 w-24" />
        </Link>
        <div className="w-full max-w-sm">
          {/* ➕ 뒤로가기 버튼 + 제목을 같은 줄에 배치 */}
          <div className="flex items-center mb-2">
            <button
              onClick={() => navigate("/")}
              className="p-2 focus:outline-none transform -translate-x-2"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-800 -ml-20" />
            </button>
            <h1 className="text-3xl font-bold -ml-4">회원가입</h1>
          </div>
          <p className="text-sm text-gray-500 mb-15">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-purple-600 underline">여기</Link>를 클릭해 로그인하세요!
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
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

            <label className="text-sm text-gray-600 mb-1">이름</label>
            <div className="flex items-center border-b border-gray-400 mb-7">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="이름을 입력하세요"
                className="w-full py-2 outline-none"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <label className="text-sm text-gray-600 mb-1">비밀번호</label>
            <div className="flex items-center border-b border-gray-400 mb-7">
              <Lock className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type={showPwd ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                className="w-full py-2 outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPwd(prev => !prev)}>
                {showPwd ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>

            <label className="text-sm text-gray-600 mb-1">비밀번호 확인</label>
            <div className="flex items-center border-b border-gray-400 mb-15">
              <Lock className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="비밀번호를 한 번 더 입력하세요"
                className="w-full py-2 outline-none"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowConfirm(prev => !prev)}>
                {showConfirm ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1D1F2C] text-white py-3 rounded-full hover:bg-gray-800 transition"
              disabled={loading}
            >
              {loading ? "처리 중..." : "회원가입"}
            </button>
          </form>
        </div>
      </div>
      <div className="w-1/2 bg-[linear-gradient(to_bottom,#1D1F2C,#000E76,#7A8AF4)] text-white flex flex-col items-center justify-center rounded-l-3xl">
        <img src="/Saly.png" alt="illustration" className="w-[60%]" />
        <h2 className="text-4xl mt-8 font-semibold">Study Link에 가입하세요</h2>
        <p className="text-sm mt-2">지금 바로 스터디를 시작해보세요</p>
      </div>
    </div>
  );
}
