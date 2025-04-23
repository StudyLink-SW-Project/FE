// src/pages/LoginPage.jsx
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);

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

          {/* 이메일 */}
          <label className="text-sm text-gray-600 mb-1">이메일</label>
          <div className="flex items-center border-b border-gray-400 mb-7">
            <Mail className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="email"
              placeholder="이메일 주소를 입력하세요.."
              className="w-full py-2 outline-none"
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
          <button className="w-full bg-[#1D1F2C] text-white py-3 rounded-full hover:bg-gray-800 transition">
            로그인
          </button>
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

