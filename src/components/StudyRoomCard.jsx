import { Users } from "lucide-react";

export default function StudyRoomCard({
  participants,
  maxParticipants,
  imageSrc,
  title,
  subtitle,
}) {
  return (
    <div className="relative bg-gray-700 rounded-lg overflow-hidden">
      {/* 방 이미지 */}
      <img
        src={imageSrc}
        alt={title}
        className="w-full h-40 object-cover"
      />
      {/* 참여 인원 표시 */}
      <div className="absolute top-2 left-2 flex items-center bg-black bg-opacity-50 text-white text-xs rounded-md px-2 py-1">
        <Users className="w-4 h-4 mr-1" />
        {participants}/{maxParticipants}
      </div>
      {/* 카드 텍스트 */}
      <div className="p-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-300">{subtitle}</p>
      </div>
    </div>
  );
}
