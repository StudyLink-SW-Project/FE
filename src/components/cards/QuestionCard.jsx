import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

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
      className="block border-b border-gray-700 py-0.4 hover:bg-[#2D2F40] transition"
    >
      {/* 왼쪽: 태그 + 제목/요약 */}
      <div className="flex-1">
        <div className="flex items-center mb-1 gap-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              accepted
                ? "bg-blue-600 text-white"
                : "bg-transparent text-blue-400 border border-blue-400"
            }`}
          >
            {accepted ? "채택됨" : "채택안됨"}
          </span>
          <FileText className="w-5 h-5 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{excerpt}</p>
      </div>

      {/* 오른쪽: 작성자·날짜시간 · 답변·조회수 */}
      <div className="mt-4 md:mt-0 text-right text-sm text-gray-400 space-y-1">
        <div>작성자: <span className="text-white">{author}</span> </div>
        <div>
          {new Date(dateTime).toLocaleDateString()}{" "}
          <span className="text-sm">{new Date(dateTime).toLocaleTimeString()}</span>
        </div>
        <div className="flex justify-end gap-4">
          <span>{answers} 답변</span>
          <span>{views} 조회</span>
        </div>
      </div>
    </Link>
  );
}
