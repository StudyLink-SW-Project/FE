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
        className="block -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 border-b border-gray-700 py-4 sm:py-5 md:py-6 hover:bg-[#2D2F40] transition-colors duration-200"
      >
        {/* 왼쪽: 태그 + 제목/요약 */}
        <div className="flex-1 pr-12 sm:pr-14 md:pr-16">
          <div className="flex items-center mb-1 sm:mb-2 gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-2 break-words">{title}</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 mb-4 sm:mb-5 md:mb-6 line-clamp-3 break-words">{displayExcerpt}</p>
        </div>
        
        {/* 하단: 왼쪽 작성자&시간, 오른쪽 답변수&조회수 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-400 text-xs sm:text-sm mt-6 sm:mt-8 gap-3 sm:gap-0">
          {/* 왼쪽: 작성자 + 작성일시 */}
          <div className="flex items-center gap-2 sm:gap-4">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-white mr-3 sm:mr-5 text-xs sm:text-sm">{author}</span>
            <span className="text-xs sm:text-sm">
              {new Date(dateTime).toLocaleDateString()}
            </span>
          </div>

          {/* 오른쪽: 답변수 + 좋아요(토글) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <span className="text-xs sm:text-sm">{answers}</span>
            </span>
            <span
              className={`flex items-center gap-1 ${
                liked ? "text-blue-400" : "text-gray-400"
              }`}
               >
              <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{likes}</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}