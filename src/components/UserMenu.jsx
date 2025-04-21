export default function UserMenu() {
    return (
      <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded shadow-md z-50">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <img src="/user_icon.png" alt="User" className="w-15 h-15 rounded-full" />
            <div>
              <p className="font-semibold">user01</p>
              <p className="text-sm text-gray-500">user01@naver.com</p>
            </div>
          </div>
        </div>
        <ul className="text-sm">
          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">내 프로필</li>
          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">내 질문</li>
          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">로그아웃</li>
        </ul>
      </div>
    );
  }
  