import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";

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
      <Header />

      <main
        className="
          flex-1
          flex flex-col-reverse md:flex-row
          items-center justify-between
          px-8 md:px-16 lg:px-32
          py-16 md:py-24
        "
      >
        {/* 왼쪽 텍스트 영역 */}
        <div className="md:w-1/2 space-y-5 ml-4 -mt-8 transform translate-x-15">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-normal">
            쉽고 빠른 연결.<br />
            Study Link
          </h1>
          <p className="text-lg md:text-xl text-gray-200">
            지금 바로 스터디를 시작해보세요
          </p>
          {/* 버튼을 감싸는 컨테이너에 relative */}
          <div className="relative inline-block mt-8">
            {/* 데코 이미지: 버튼 왼쪽 위에 absolute 배치 */}
            <img
              src={"/effect.png"}
              alt="decorative"
              className="absolute -top-6 -left-9 w-15 h-8 transform -rotate-45"
            />
            <button
              onClick={() => navigate("/study-room")}
              className="
                cursor-pointer
                px-7 py-6
                bg-gradient-to-t from-purple-700 to-purple-500
                rounded-full
                text-white font-bold text-3x1
                hover:from-purple-900 hover:to-purple-700
                transition
              "
            >
              지금 스터디 시작하기
            </button>
          </div>
       
        </div>

        {/* 오른쪽 일러스트 영역 */}
        <div className="md:w-1/2 mb-12 md:mb-0">
          <img
            src="/Saly.png"
            alt="Study Link Character"
            className="w-full mx-auto"
          />
        </div>
      </main>
      {/* 우측 하단 고정 아이콘 */}
      <img
        src={"/logo_black.png"}
        alt="Decorative Icon"
        className="absolute bottom-1 right-4 w-20 h-20"
      />
    </div>
  );
}
