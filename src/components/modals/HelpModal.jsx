import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  const [page, setPage] = useState(0);
  const pages = [
    {
      key: 0,
      imgSrc: '/help/help-1.png',
      title: '도움말 1',
      description: '첫 번째 도움말 내용입니다.',
    },
    {
      key: 1,
      imgSrc: '/help/help-2.png',
      title: '도움말 2',
      description: '두 번째 도움말 내용입니다.',
    },
    {
      key: 2,
      imgSrc: '/help/help-3.png',
      title: '도움말 3',
      description: '세 번째 도움말 내용입니다.',
    },
    {
      key: 3,
      imgSrc: '/help/help-4.png',
      title: '도움말 4',
      description: '네 번째 도움말 내용입니다.',
    },
  ];

  const prevPage = () => setPage((prev) => (prev === 0 ? pages.length - 1 : prev - 1));
  const nextPage = () => setPage((prev) => (prev === pages.length - 1 ? 0 : prev + 1));

  if (!isOpen) return null;

  const { imgSrc, title, description } = pages[page];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white w-2/4 h-3/4 rounded-lg shadow-lg flex overflow-hidden">
        {/* Left Arrow */}
        <button
          onClick={prevPage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-100 z-10"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Content: Left Image & Right Text */}
        <div className="flex-1 flex">
          {/* Left: Image */}
          <div className="w-1/2 flex items-center justify-center bg-gray-100">
            <img src={imgSrc} alt={title} className="max-w-full max-h-full" />
          </div>
          {/* Right: Description */}
          <div className="w-1/2 p-6 overflow-auto">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <p className="text-base leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={nextPage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-100 z-10"
        >
          <ChevronRight size={24} />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
