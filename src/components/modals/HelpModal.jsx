import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  const [page, setPage] = useState(0);
  const pages = [
    {
      key: 0,
      imgSrcs: ['/help/help1-1.png', '/help/help1-2.png'],
      title: '1. 스터디룸 시작하기',
      description: '우측 상단 + 버튼으로 스터디룸 생성이 가능합니다.\n\n\n\n\n현재 생성된 방이 없다면, 하단 스터디룸 생성하기 버튼을 통해 생성할 수 있습니다.',
    },
    {
      key: 1,
      imgSrcs: ['/help/help2-1.png'],
      title: '2. 스터디룸 생성하기',
      description: '방 이름, 방 소개, 비밀번호, 배경 이미지를 설정하고, \n방을 생성할 수 있습니다. \n-> 생성이 완료되면 스터디룸에 바로 입장합니다.\n\n*방 이름은 필수 옵션입니다.',
    },
    {
      key: 2,
      imgSrcs: ['/help/help3-1.png', '/help/help3-2.png'],
      title: '3. 스터디룸 입장하기',
      description: '생성된 스터디룸을 페이지에서 확인할 수 있습니다.\n클릭을 통해 입장이 가능합니다.\n\n\n\n\n입장버튼을 누르면 스터디룸에 입장합니다.\n비밀번호 설정된 방은 비밀번호 입력이 필요합니다.',
    },
    {
      key: 3,
      imgSrcs: ['/help/help4-1.png'],
      title: '4. 목표 설정하기 / 공부 기록 확인하기',
      description: '나의 목표 공부 시간, D-Day, 각오를 설정하고 \n확인할 수 있습니다.\n\n스터디룸 이용을 마치고, \n오늘, 누적 공부 시간을 확인할 수 있습니다.',
    },
  ];

  const prevPage = () => setPage((prev) => (prev === 0 ? pages.length - 1 : prev - 1));
  const nextPage = () => setPage((prev) => (prev === pages.length - 1 ? 0 : prev + 1));

  if (!isOpen) return null;

  const { imgSrcs, title, description } = pages[page];
  const imgCount = imgSrcs.length;
  const imgHeight = imgCount > 0 ? `${100 / imgCount}%` : '100%';

  return (
    <div className="fixed inset-0 backdrop-opacity-70 backdrop-brightness-20 flex items-center justify-center z-50">
      <div className="relative bg-white w-2/4 h-2/4 rounded-lg shadow-lg flex overflow-hidden">
        {/* Left Arrow: 투명 배경, hover 시 흰 배경 */}
        <button
          onClick={prevPage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-transparent rounded-full transition-colors duration-200 hover:bg-gray-100 hover:bg-opacity-50 z-10 cursor-pointer"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Content: Left Images & Right Text */}
        <div className="flex-1 flex h-full">
          <div className="w-1/2 flex bg-gray-100 p-2">
            {imgCount > 0 ? (
              <div className="w-full flex flex-col">
                {imgSrcs.map((src, idx) => (
                  <div key={idx} className="w-full" style={{ height: imgHeight }}>
                    <img
                      src={src}
                      alt={`${title} 이미지 ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                이미지가 없습니다.
              </div>
            )}
          </div>

          <div className="w-1/2 p-6 overflow-auto">
            <h2 className="text-xl font-semibold mb-4 whitespace-pre-wrap">{title}</h2>
            <p className="text-base leading-relaxed whitespace-pre-wrap">{description}</p>
          </div>
        </div>

        {/* Right Arrow: 투명 배경, hover 시 흰 배경 */}
        <button
          onClick={nextPage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-transparent rounded-full transition-colors duration-200 hover:bg-gray-100 hover:bg-opacity-50 z-10 cursor-pointer"
        >
          <ChevronRight size={24} />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
