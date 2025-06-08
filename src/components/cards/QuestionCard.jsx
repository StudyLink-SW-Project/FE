import { Link } from "react-router-dom";
import { FileText, User, ThumbsUp, MessageCircle } from "lucide-react";

export default function QuestionCard({
  id,
  title,
  excerpt,
  author,
  date,
  dateTime,
  answers,
  likes,
  liked,
}) {
  // 최대 100자까지 보여주고 초과 시 ... 처리
  const displayExcerpt =
    excerpt.length > 100 ? excerpt.slice(0, 100) + "..." : excerpt;

  return (
    <div className="relative group">
      <Link
        to={`/questions/${id}`}
        state={{          
          id,
          title,
          excerpt,
          author,         
          date,
          dateTime,
          answers,
          likes,
          liked,
        }}
        className="block -mx-8 px-8 border-b border-gray-700 py-6 hover:bg-[#2D2F40] transition-colors duration-200"
      >
        {/* 왼쪽: 태그 + 제목/요약 */}
        <div className="flex-1 pr-16"> {/* ★ 삭제 버튼 공간 확보를 위해 오른쪽 패딩 추가 */}
          <div className="flex items-center mb-1 gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white line-clamp-2">{title}</h3>
          </div>
          <p className="text-sm text-gray-400 mt-1 mb-6 line-clamp-3">{displayExcerpt}</p>
        </div>
        {/* 하단: 왼쪽 작성자&시간, 오른쪽 답변수&조회수 */}
        <div className="flex justify-between items-center text-gray-400 text-sm mt-8">
          {/* 왼쪽: 작성자 + 작성일시 */}
          <div className="flex items-center gap-4">
            <User className="w-4 h-4 -mr-2 text-gray-400" />
            <span className="font-medium text-white mr-5">{author}</span>
            <span className="text-sm">
              {new Date(dateTime).toLocaleDateString()}
            </span>
          </div>

          {/* 오른쪽: 답변수 + 좋아요(토글) */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-gray-400" />
              {answers}
            </span>
            <span
              className={`flex items-center gap-1 ${
                liked ? "text-blue-400" : "text-gray-400"
              }`}
               >
              <ThumbsUp className="w-4 h-4" />
              {likes}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}