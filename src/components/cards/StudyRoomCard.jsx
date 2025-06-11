import { Users, Lock } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext"; 

export default function StudyRoomCard({
  participants,
  maxParticipants,
  imageSrc,
  title,
  subtitle,
  isLocked = false,
}) {
  const { isDark } = useTheme();

  return (
    <div className="w-full">
      <div className={`relative z-0 w-full border rounded-lg overflow-hidden transition-colors duration-200 ${isDark ? 'bg-[#1D1F2C] border-[#616680] hover:border-[#8B8FA3]' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
        {/* 방 이미지 */}
        <img
          src={imageSrc}
          alt={title}
          className={`w-full h-32 sm:h-40 md:h-48 lg:h-50 object-cover ${isDark ? 'bg-[#1D1F2C]' : 'bg-gray-100'}`}
        />
        
        {/* 참여 인원 표시 */}
        <div className="absolute top-2 left-2 flex items-center bg-black bg-opacity-60 text-white text-xs rounded-md px-2 py-1">
          <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          <span className="text-xs sm:text-sm font-medium">{participants}/{maxParticipants}</span>
        </div>
        
        {/* 비밀번호 잠금 아이콘 */}
        {isLocked && (
          <div className="absolute top-2 right-2 flex items-center bg-black bg-opacity-60 text-white text-xs rounded-md p-1.5">
            <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        )}
      </div>
      
      {/* 카드 텍스트 */}
      <div className="p-2 sm:p-3">
        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`text-xs sm:text-sm mt-1 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} title={subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}