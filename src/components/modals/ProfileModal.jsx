// src/components/modals/ProfileModal.jsx
import { useSelector } from 'react-redux';
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
        bg-black bg-opacity-75
        flex items-center justify-center
        z-[9999]
      "
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 mx-4">
        {/* 아바타 영역 */}
        <div className="flex justify-center -mt-16 mb-6">
          <div
            className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200"
            style={{
              backgroundImage: `url(${avatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

        {/* 사용자 정보 */}
        <div className="text-center mb-6 space-y-2">
          <h2 className="text-3xl text-black font-semibold">{user?.userName}</h2>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        {/* 정보 섹션 */}
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="w-24 text-gray-500">이름</span>
            <span className="text-gray-600 font-medium">{user?.userName}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 text-gray-500">이메일</span>
            <span className="text-gray-600 font-medium">{user?.email}</span>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className="mt-8 text-center">
          <button
            onClick={handleClose}
            className="cursor-pointer inline-block bg-transparent text-indigo-400 hover:text-indigo-200 font-medium"
          >
            &larr; 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
