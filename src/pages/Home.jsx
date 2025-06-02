import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="
        relative
        min-h-screen
        bg-gradient-to-br from-[#000217] via-[#4F4EB2] to-purple-200
        text-white
        flex flex-col
      "
    >
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-300/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-blue-300/5 rounded-full blur-2xl"></div>
      </div>

      <Header />

      <main className="flex-1 flex flex-col">
        {/* 히어로 섹션 */}
        <section
          className="
            flex-1
            flex flex-col-reverse md:flex-row
            items-center justify-between
            px-8 md:px-16 lg:px-32
            py-16 md:py-24
          "
        >
          {/* 왼쪽 텍스트 영역 */}
          <div className="md:w-1/2 space-y-6 ml-4 -mt-8 transform translate-x-15 relative z-10">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                쉽고 빠른 연결.<br />
                <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  Study Link
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                언제 어디서든 친구들과 함께<br />
                효율적인 스터디를 시작해보세요
              </p>
            </div>

            {/* CTA 버튼 */}
            <div className="mt-8">
              <button
                onClick={() => navigate("/study-room")}
                className="
                  group cursor-pointer
                  px-8 py-4
                  bg-gradient-to-r from-purple-600 to-blue-600
                  hover:from-purple-700 hover:to-blue-700
                  rounded-full
                  text-white font-bold text-xl
                  flex items-center gap-3
                  transition-all duration-300
                  shadow-lg hover:shadow-xl
                  transform hover:scale-105
                "
              >
                스터디 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* 오른쪽 일러스트 영역 */}
          <div className="md:w-1/2 mb-12 md:mb-0 relative">
            <div className="relative">
              <img
                src="/Saly.png"
                alt="Study Link Character"
                className="w-full mx-auto relative z-10"
              />
              {/* 캐릭터 뒤 글로우 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl scale-75"></div>
            </div>
          </div>
        </section>
      </main>

      {/* 우측 하단 고정 아이콘 */}
      <img
        src={"/logo_black.png"}
        alt="Decorative Icon"
        className="absolute bottom-4 right-4 w-16 h-16 opacity-30"
      />
    </div>
  );
}