import Header from "../components/Header";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="
        min-h-screen
        //bg-[linear-gradient(to_bottom,#1D1F2C,#353F84,#7A8AF4)]
        //bg-[linear-gradient(to_bottom,#1D1F2C,#000E76_30%,#7A8AF4)]
        bg-gradient-to-b from-slate-950 via-blue-900 to-indigo-300
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
        <div className="md:w-1/2 space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-normal">
            쉽고 빠른 연결.<br />
            Study Link
          </h1>
          <p className="text-lg md:text-xl text-gray-200">
            지금 바로 스터디를 시작해보세요
          </p>
          <button
            onClick={() => navigate("/study-room")}
            className="
              px-8 py-5
              bg-gradient-to-t from-[#0918CC] to-[#3744DA]
              rounded-full
              text-white font-bold text-3x1
              hover:from-[#00021B] hover:to-[#323DC2]
              transition
              "
          >
            지금 스터디 시작하기
          </button>
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
    </div>
  );
}
