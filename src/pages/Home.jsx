import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-[rgb(40,42,54)] text-white">
      <Header />
      <main className="p-8">
        {/* 여기에 메인 콘텐츠가 들어갑니다 */}
      </main>
    </div>
  );
}
