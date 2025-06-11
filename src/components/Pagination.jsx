import { useTheme } from "../contexts/ThemeContext";
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { isDark } = useTheme(); 

  return (
    <div className={`fixed bottom-0 left-0 w-full flex justify-center py-4 space-x-2 text-white z-40 ${isDark ? 'bg-[#282A36]' : 'bg-gray-50'}`}>        
      {/* 이전 버튼 */}
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={`cursor-pointer px-3 py-1 rounded transition-colors ${isDark ? 'bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white' : 'bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-700'}`}
      >
        &laquo;
      </button>

      {/* 번호 버튼 */}
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={`cursor-pointer px-3 py-1 rounded transition-colors ${
            currentPage === i + 1
              ? "bg-blue-500 font-semibold text-white"
              : isDark 
                ? "bg-gray-600 hover:bg-gray-500 text-white"
                : "bg-gray-300 hover:bg-gray-400 text-gray-700"
          }`}
        >
          {i + 1}
        </button>
      ))}

      {/* 다음 버튼 */}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`cursor-pointer px-3 py-1 rounded transition-colors ${isDark ? 'bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white' : 'bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-700'}`}
      >
        &raquo;
      </button>
    </div>
  );
}