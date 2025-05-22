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
    <div>
      <div className="relative z-0 bg-[#1D1F2C] w-56 max-w-full border border-[#616680]">
        {/* 방 이미지 */}
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-35 object-cover bg-[#1D1F2C]"
        />
        {/* 참여 인원 표시 */}
        <div className="absolute top-1 left-1 flex items-center bg-black bg-opacity-50 text-white text-xs rounded-md px-2 py-1">
          <Users className="w-4 h-4 mr-1" />
          {participants}/{maxParticipants}
        </div>
        {/* 비밀번호 잠금 아이콘 */}
        {isLocked && (
          <div className="absolute top-1 right-1 flex items-center bg-black bg-opacity-10 text-white text-xs rounded-md p-1">
            <Lock className="w-4 h-4" />
          </div>
        )}
      </div>
        {/* 카드 텍스트 */}
      <div className="p-1">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-xs text-gray-300">{subtitle}</p>
      </div>
    </div>
  );
}
