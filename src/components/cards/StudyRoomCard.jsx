import { Users, Lock } from "lucide-react";

export default function StudyRoomCard({
  participants,
  maxParticipants,
  imageSrc,
  title,
  subtitle,
  isLocked = false,
}) {
  return (
    <div className="w-full">
      <div className="relative z-0 bg-[#1D1F2C] w-full border border-[#616680] rounded-lg overflow-hidden hover:border-[#8B8FA3] transition-colors duration-200">
        {/* 방 이미지 */}
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-32 sm:h-40 md:h-48 lg:h-50 object-cover bg-[#1D1F2C]"
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
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-300 mt-1 line-clamp-2" title={subtitle}></p>
      </div>
    </div>
  );
}

      //   {/* 카드 텍스트 */}
      // <div className="p-1">
      //   <h3 className="font-semibold text-white">{title}</h3>
      //   <p className="text-xs text-gray-300">{subtitle}</p>
      // </div>