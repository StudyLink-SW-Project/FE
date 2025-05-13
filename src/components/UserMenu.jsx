import userIcon from '../assets/user_icon.png';

export default function UserMenu({ user, onClose, onLogout }) {
  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-56 max-h-[calc(100vh-4rem)] overflow-auto bg-white text-black rounded shadow-md z-50">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <img src={userIcon} alt="User" className="w-15 h-15 rounded-full -ml-2 mr-1" />
          <div>
            <p className="font-semibold">{user?.userName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
      <ul className="text-sm">
        <li className="px-4 py-4 hover:bg-gray-100 cursor-pointer">내 프로필</li>
        <li className="px-4 py-4 hover:bg-gray-100 cursor-pointer">내 질문</li>
        <li className="px-4 py-4 hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>로그아웃</li>
      </ul>
    </div>
  );
}