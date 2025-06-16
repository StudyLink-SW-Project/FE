// src/components/modals/ProfileModal.jsx
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';
import userIcon from '../../assets/default.png';

/**
 * ProfileModal
 * 프로필 페이지 내용을 배경 어두운 모달로 보여줍니다.
 * Props:
 *  - onClose: 모달 닫기 핸들러
 */
export default function ProfileModal({ onClose }) {
  const { user } = useSelector(state => state.auth);

const avatar = userIcon;

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className="
        fixed inset-0
        w-full h-full
        backdrop-opacity-70 backdrop-brightness-20
        flex items-center justify-center
        z-[9999]
        p-4
      "
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm sm:max-w-md p-6 sm:p-8 mx-4 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 아바타 영역 */}
        <div className="flex justify-center -mt-12 sm:-mt-16 mb-4 sm:mb-6">
          <div
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200"
            style={{
              backgroundImage: `url(${avatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

        {/* 사용자 정보 */}
        <div className="text-center mb-4 sm:mb-6 space-y-2">
          <h2 className="text-2xl sm:text-3xl text-black font-semibold break-words">{user?.userName}</h2>
          <p className="text-gray-600 text-sm sm:text-base break-words">{user?.email}</p>
        </div>

        {/* 정보 섹션 */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center">
            <span className="w-16 sm:w-24 text-gray-500 text-sm sm:text-base flex-shrink-0">이름</span>
            <span className="text-gray-600 font-medium text-sm sm:text-base break-words flex-1">{user?.userName}</span>
          </div>
          <div className="flex items-start sm:items-center">
            <span className="w-16 sm:w-24 text-gray-500 text-sm sm:text-base flex-shrink-0">이메일</span>
            <span className="text-gray-600 font-medium text-sm sm:text-base break-words flex-1">{user?.email}</span>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className="text-center">
          <button
            onClick={handleClose}
            className="cursor-pointer inline-block bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}