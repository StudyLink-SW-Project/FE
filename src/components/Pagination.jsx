// src/components/Pagination.jsx
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // if (totalPages <= 1) return null;

  return (
    <div
      className="
        fixed bottom-0 left-0 w-full
        bg-background            /* 라이트/다크 모드 배경 */
        flex justify-center
        py-4 space-x-2
        text-foreground          /* 텍스트도 라이트/다크 모드 대응 */
        z-50
      "
    >
      {/* 이전 버튼 */}
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="
          px-3 py-1 rounded
          bg-background
          hover:bg-background/20 dark:hover:bg-background/40
          disabled:opacity-50
        "
      >
        &laquo;
      </button>

      {/* 번호 버튼 */}
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={`
            px-3 py-1 rounded
            ${currentPage === i + 1
              ? "bg-primary text-white font-semibold"      /* 활성 페이지 색상 */
              : "bg-background hover:bg-background/20 dark:hover:bg-background/40" /* 비활성 페이지 */
            }
          `}
        >
          {i + 1}
        </button>
      ))}

      {/* 다음 버튼 */}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="
          px-3 py-1 rounded
          bg-background
          hover:bg-background/20 dark:hover:bg-background/40
          disabled:opacity-50
        "
      >
        &raquo;
      </button>
    </div>
  );
}
