import { Link } from "react-router-dom";
import { FileText, User } from "lucide-react";

export default function QuestionCard({
  id,
  accepted,
  title,
  excerpt,
  author,
  date,
  dateTime,
  answers,
  views,
}) {
  return (
    <Link
      to={`/questions/${id}`}
      state={{          // ← 이 부분에 author 가 포함되어야
        id,
        accepted,
        title,
        excerpt,
        author,         // ← author 추가
        date,
        dateTime,
        answers,
        views
      }}
      className="block -mx-8 px-8 border-b border-gray-700 py-6 hover:bg-[#2D2F40] transition-colors duration-200"
    >
      {/* 왼쪽: 태그 + 제목/요약 */}
      <div className="flex-1">
        <div className="flex items-center mb-1 gap-2">
          <FileText className="w-5 h-5 text-gray-300" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2 mb-6">{excerpt}</p>
      </div>
      {/* 하단: 왼쪽 작성자&시간, 오른쪽 답변수&조회수 */}
        <div className="flex justify-between items-center text-gray-400 text-sm mt-8">
          {/* 왼쪽: 작성자 + 작성일시 */}
          <div className="flex items-center gap-4">
            <User className="w-4 h-4 -mr-2 text-gray-400" />
            <span className="font-medium text-white mr-5">{author}</span>
            <span className="text-sm">
              {new Date(dateTime).toLocaleString()}
            </span>
          </div>

          {/* 오른쪽: 답변수 + 조회수 */}
          <div className="flex items-center gap-4">
            <span>답변 {answers}개</span>
            <span>조회 {views}회</span>
          </div>
        </div>
    </Link>
  );
}
