import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function HelpModal({ isOpen, onClose }) {
  const [page, setPage] = useState(0);
  const { isDark } = useTheme();
  
  const pages = [
    {
      key: 0,
      imgSrcs: ['/help/help1-1.png', '/help/help1-2.png'],
      title: '1. 스터디룸 시작하기',
      description: '🎯 스터디룸 생성 방법\n\n• 우측 상단의 + 버튼을 클릭하여 새로운 스터디룸을 생성할 수 있습니다.\n\n• 현재 생성된 방이 없는 경우, 화면 중앙의 "스터디룸 생성하기" 버튼을 이용해주세요.\n\n• 생성된 방은 실시간으로 목록에 표시됩니다.',
    },
    {
      key: 1,
      imgSrcs: ['/help/help2-1.png'],
      title: '2. 스터디룸 생성하기',
      description: '⚙️ 방 설정하기\n\n• 방 이름: 다른 사용자들이 볼 수 있는 방 제목\n• 방 소개: 스터디 주제나 목적을 간단히 설명\n• 비밀번호: 원하는 사람만 입장할 수 있도록 설정 (선택)\n• 배경 이미지: 4가지 테마 중 원하는 배경 선택\n\n✅ 설정 완료 후 "생성 후 입장하기" 버튼을 누르면 바로 스터디룸에 입장됩니다.',
    },
    {
      key: 2,
      imgSrcs: ['/help/help3-1.png', '/help/help3-2.png'],
      title: '3. 스터디룸 입장하기',
      description: '🚪 방 입장 방법\n\n• 스터디룸 목록에서 원하는 방을 클릭.\n• 참여 인원과 최대 인원, 잠금 상태를 확인할 수 있습니다.\n\n🔐 비밀번호가 설정된 방의 경우:\n• 입장 시 비밀번호 입력창이 나타납니다.\n• 올바른 비밀번호를 입력해야 입장 가능합니다.',
    },
    {
      key: 3,
      imgSrcs: ['/help/help4-1.png'],
      title: '4. 목표 설정 및 공부 기록',
      description: '📊 개인 학습 관리\n\n• 일일 목표 공부 시간 설정\n• D-Day 등록으로 시험이나 중요한 날짜 관리\n• 개인 각오 작성으로 동기 부여\n\n📈 학습 기록 확인:\n• 오늘 공부한 시간 실시간 확인\n• 누적 총 공부 시간 통계\n• 목표 달성률을 통한 성취도 확인\n\n',
    },
  ];

  const prevPage = () => setPage((prev) => (prev === 0 ? pages.length - 1 : prev - 1));
  const nextPage = () => setPage((prev) => (prev === pages.length - 1 ? 0 : prev + 1));

  if (!isOpen) return null;

  const { imgSrcs, title, description } = pages[page];
  const imgCount = imgSrcs.length;
  const imgHeight = imgCount > 0 ? `${100 / imgCount}%` : '100%';

  return (
    <div className="fixed inset-0 backdrop-opacity-70 backdrop-brightness-20 flex items-center justify-center z-[9999] p-4 sm:p-4">
      <div
        className={`
          relative w-11/12 h-4/5 sm:w-11/12 sm:h-5/6 lg:w-2/4 lg:h-2/4
          rounded-lg shadow-lg flex flex-col lg:flex-row overflow-hidden
          ${isDark ? 'bg-[#282A36] text-white' : 'bg-white text-black'}
        `}
      >
        {/* 모바일/태블릿 헤더 (상단 고정) */}
        <div className="flex lg:hidden justify-between items-center p-4 border-b border-gray-300 dark:border-gray-600">
          <h2 className="text-lg font-semibold truncate pr-4">{title}</h2>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0
              ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
            `}
          >
            <X size={20} />
          </button>
        </div>

        {/* 네비게이션 화살표 - 데스크탑만 */}
        <button
          onClick={prevPage}
          className={`
            hidden lg:block absolute left-2 top-1/2 transform -translate-y-1/2 
            p-2 rounded-full transition-colors duration-200 z-10 cursor-pointer
            ${isDark 
              ? 'bg-transparent hover:bg-gray-700 hover:bg-opacity-50' 
              : 'bg-transparent hover:bg-gray-100 hover:bg-opacity-50'}
          `}
        >
          <ChevronLeft size={24} className={isDark ? 'text-white' : 'text-black'} />
        </button>

        <button
          onClick={nextPage}
          className={`
            hidden lg:block absolute right-2 top-1/2 transform -translate-y-1/2 
            p-2 rounded-full transition-colors duration-200 z-10 cursor-pointer
            ${isDark 
              ? 'bg-transparent hover:bg-gray-700 hover:bg-opacity-50' 
              : 'bg-transparent hover:bg-gray-100 hover:bg-opacity-50'}
          `}
        >
          <ChevronRight size={24} className={isDark ? 'text-white' : 'text-black'} />
        </button>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
          
          {/* 이미지 패널 */}
          <div className={`
            w-full lg:w-1/2 h-1/3 lg:h-full p-2 flex flex-col
            ${isDark ? 'bg-gray-700' : 'bg-gray-100'}
          `}>
            {imgCount > 0 ? (
              imgSrcs.map((src, idx) => (
                <div key={idx} className="w-full flex-1" style={{ height: imgHeight }}>
                  <img
                    src={src}
                    alt={`${title} 이미지 ${idx + 1}`}
                    className="w-full h-full object-contain rounded"
                  />
                </div>
              ))
            ) : (
              <div className={`flex-1 flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="text-sm sm:text-base">이미지가 없습니다.</span>
              </div>
            )}
          </div>

          {/* 텍스트 패널 */}
          <div className="w-full lg:w-1/2 h-2/3 lg:h-full p-4 lg:p-6 overflow-auto flex flex-col">
            {/* 데스크탑 제목 */}
            <div className="hidden lg:flex justify-between items-start mb-4">
              <h2 className="text-xl lg:text-2xl font-semibold whitespace-pre-wrap flex-1 pr-4">
                {title}
              </h2>
              <button
                onClick={onClose}
                className={`
                  p-2 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0
                  ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                `}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 설명 텍스트 */}
            <div className="flex-1">
              <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
            
            {/* 모바일 네비게이션 */}
            <div className="flex lg:hidden justify-between items-center mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
              <button
                onClick={prevPage}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer
                  ${isDark 
                    ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}
                `}
              >
                <ChevronLeft size={18} />
                <span className="text-sm">이전</span>
              </button>
              
              {/* 페이지 인디케이터 */}
              <div className="flex gap-2">
                {pages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPage(idx)}
                    className={`
                      w-2 h-2 rounded-full transition-colors duration-200 cursor-pointer
                      ${idx === page 
                        ? 'bg-blue-500' 
                        : isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'}
                    `}
                  />
                ))}
              </div>
              
              <button
                onClick={nextPage}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer
                  ${isDark 
                    ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}
                `}
              >
                <span className="text-sm">다음</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 데스크탑 페이지 인디케이터 */}
        <div className="hidden lg:flex absolute bottom-4 left-1/2 transform -translate-x-1/2 gap-2 z-10">
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx)}
              className={`
                w-3 h-3 rounded-full transition-colors duration-200 cursor-pointer
                ${idx === page 
                  ? 'bg-blue-500' 
                  : isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-400 hover:bg-gray-500'}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}