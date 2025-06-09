// src/components/Pagination.jsx
export default function Pagination({ currentPage, totalPages, onPageChange }) {
    // if (totalPages <= 1) return null;
  
    return (
          <div
            className="
              fixed bottom-0 left-0 w-full      /* 하단 고정, 풀 너비 */
              bg-[#282A36]                       /* 뒤 배경색 (페이지 배경과 맞추거나 반투명으로) */
              flex justify-center               /* 가운데 정렬 */
              py-4 space-x-2 text-white z-40     /* 위아래 패딩·간격·z-index 낮춤 */
          ">        
        {/* 이전 버튼 */}
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="cursor-pointer px-3 py-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
        >
          &laquo;
        </button>
  
        {/* 번호 버튼 */}
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            className={`cursor-pointer px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-blue-500 font-semibold"
                : "bg-gray-600 hover:bg-gray-500"
            }`}
          >
            {i + 1}
          </button>
        ))}
  
        {/* 다음 버튼 */}
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="cursor-pointer px-3 py-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
        >
          &raquo;
        </button>
      </div>
    );
  }