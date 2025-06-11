import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext"; 

export default function Home() {
  const navigate = useNavigate();
  const { isDark } = useTheme(); 

  return (
    <div className={`
      relative min-h-screen 
      ${isDark 
        ? 'bg-gradient-to-br from-[#000217] via-[#4F4EB2] to-purple-200' 
        : 'bg-gradient-to-br  via-indigo-100 from-blue-500 to-purple-100'
      }
      ${isDark ? 'text-white' : 'text-gray-900'}
      flex flex-col
    `}>
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-10 sm:top-20 left-5 sm:left-10 w-16 h-16 sm:w-32 sm:h-32 
          ${isDark ? 'bg-white/5' : 'bg-blue-500/10'} rounded-full blur-xl`}></div>
        <div className={`absolute top-20 sm:top-40 right-10 sm:right-20 w-12 h-12 sm:w-24 sm:h-24 
          ${isDark ? 'bg-purple-300/10' : 'bg-purple-500/15'} rounded-full blur-lg`}></div>
        <div className={`absolute bottom-16 sm:bottom-32 left-1/6 sm:left-1/4 w-20 h-20 sm:w-40 sm:h-40 
          ${isDark ? 'bg-blue-300/5' : 'bg-indigo-500/10'} rounded-full blur-2xl`}></div>
      </div>

      <Header />

      <main className="flex-1 flex flex-col">
        {/* 히어로 섹션 */}
        <section className="flex-1 flex flex-col-reverse md:flex-row items-center justify-between px-4 sm:px-8 md:px-16 lg:px-32 py-8 sm:py-12 md:py-16 lg:py-24">
          {/* 왼쪽 텍스트 영역 */}
          <div className="w-full md:w-1/2 space-y-4 sm:space-y-6 text-center md:text-left mt-8 md:mt-0 md:ml-4 md:transform md:translate-x-15 relative z-10">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                온라인 스터디룸<br />
                <span className={`
                  ${isDark 
                    ? 'bg-gradient-to-r from-purple-300 to-blue-300' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600'
                  } bg-clip-text text-transparent
                `}>
                  Study Link
                </span>
              </h1>
              <p className={`text-base sm:text-lg md:text-xl leading-relaxed
                ${isDark ? 'text-gray-200' : 'text-gray-600'}
              `}>
                지금 바로 스터디를 시작해보세요
              </p>
            </div>

            {/* CTA 버튼 */}
            <div className="mt-6 sm:mt-8">
              <button
                onClick={() => navigate("/study-room")}
                className={`
                  group cursor-pointer px-6 py-3 sm:px-8 sm:py-4 rounded-full
                  text-white font-bold text-lg sm:text-xl
                  flex items-center gap-3 transition-all duration-300
                  shadow-lg hover:shadow-xl transform hover:scale-105 mx-auto md:mx-0
                  ${isDark 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    : 'bg-gradient-to-r from-purple-300 to-blue-400 hover:from-purple-600 hover:to-blue-600'
                  }
                `}
              >
                스터디 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* 오른쪽 일러스트 영역 */}
          <div className="w-full md:w-1/2 mb-8 md:mb-0 relative">
            <div className="relative">
              <img
                src="/Saly.png"
                alt="Study Link Character"
                className="w-full max-w-sm sm:max-w-md mx-auto md:w-full md:max-w-none relative z-10"
              />
              {/* 캐릭터 뒤 글로우 효과 */}
              <div className={`absolute inset-0 rounded-full blur-3xl scale-75
                ${isDark 
                  ? 'bg-gradient-to-r from-purple-400/20 to-blue-400/20'
                  : 'bg-gradient-to-r from-purple-300/30 to-blue-300/30'
                }
              `}></div>
            </div>
          </div>
        </section>
      </main>

      {/* 우측 하단 고정 아이콘 */}
      <img
        src={isDark ? "/logo_white.png" : "/logo_black.png"}
        alt="Decorative Icon"
        className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-12 h-12 sm:w-16 sm:h-16 opacity-30"
      />
    </div>
  );
}
