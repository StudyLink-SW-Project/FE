// import { createContext, useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // 개발 시엔 "/"로 프록시, 배포 시엔 실제 API_BASE_URL 사용
//   const API_BASE_URL = import.meta.env.DEV
//     ? '/'
//     : (import.meta.env.VITE_APP_SERVER || 'https://api.studylink.store/');

//   // 로그인 처리
//   const login = async (email, password) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}user/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include', // 쿠키 포함
//         body: JSON.stringify({ email, password }),
//       });
//       const data = await response.json();
//       if (!data.isSuccess) {
//         throw new Error(data.message || '로그인에 실패했습니다.');
//       }
//       // 로그인 성공 후 사용자 정보 조회
//       await fetchUserInfo();
//       return true;
//     } catch (error) {
//       console.error('로그인 오류:', error);
//       return false;
//     }
//   };

//   // 회원가입 처리
//   const signup = async (email, name, password) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}user/signup`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, name, password }),
//       });
//       const data = await response.json();
//       if (!data.result?.isSuccess) {
//         throw new Error(data.message || '회원가입에 실패했습니다.');
//       }
//       return true;
//     } catch (error) {
//       console.error('회원가입 오류:', error);
//       return false;
//     }
//   };

//   // 사용자 정보 가져오기
//   const fetchUserInfo = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}user/info`, {
//         method: 'POST', // GET에서 POST로 변경: 서버가 POST만 허용하도록 메소드 수정
//         credentials: 'include',
//       });
//       if (!response.ok) {
//         if (response.status === 401) {
//           const refreshed = await refreshToken();
//           if (!refreshed) {
//             setUser(null);
//             setLoading(false);
//             return false;
//           }
//           return await fetchUserInfo();
//         }
//         throw new Error('사용자 정보를 가져오는데 실패했습니다.');
//       }
//       const data = await response.json();
//       setUser(data.result);
//       setLoading(false);
//       return true;
//     } catch (error) {
//       console.error('사용자 정보 오류:', error);
//       setUser(null);
//       setLoading(false);
//       return false;
//     }
//   };

//   // 토큰 재발급
//   const refreshToken = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}api/v1/reissue/access-token`, {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${getRefreshToken()}`,
//         },
//       });
//       if (!response.ok) throw new Error('토큰 재발급에 실패했습니다.');
//       await response.json();
//       return true;
//     } catch (error) {
//       console.error('토큰 재발급 오류:', error);
//       return false;
//     }
//   };

//   // 로그아웃 처리
//   const logout = () => {
//     document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//     document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//     setUser(null);
//     navigate('/');
//   };

//   // 쿠키에서 리프레시 토큰 꺼내기
//   const getRefreshToken = () => {
//     const cookies = document.cookie.split(';');
//     for (let cookie of cookies) {
//       cookie = cookie.trim();
//       if (cookie.startsWith('refreshToken=')) {
//         return cookie.substring('refreshToken='.length);
//       }
//     }
//     return null;
//   };

//   // 소셜 로그인 URL
//   const getSocialLoginUrl = (provider) =>
//     `${API_BASE_URL}oauth2/authorization/${provider}`;

//   // 앱 초기 로드 시 유저 정보 확인
//   useEffect(() => {
//     fetchUserInfo();
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         logout,
//         signup,
//         getSocialLoginUrl,
//         isAuthenticated: !!user,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }
import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 개발 시엔 "/"로 프록시, 배포 시엔 실제 API_BASE_URL 사용
  const API_BASE_URL = import.meta.env.DEV
    ? '/'
    : (import.meta.env.VITE_APP_SERVER || 'https://api.studylink.store/');

  // 로그인 처리
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!data.isSuccess) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }
      // 로그인 성공 후 사용자 정보 조회 및 상태 설정
      const success = await fetchUserInfo();
      return success;
    } catch (error) {
      console.error('로그인 오류:', error);
      return false;
    }
  };

  // 회원가입 처리
  const signup = async (email, name, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await response.json();
      if (!data.result?.isSuccess) {
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }
      return true;
    } catch (error) {
      console.error('회원가입 오류:', error);
      return false;
    }
  };

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}user/info`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (!refreshed) {
            setUser(null);
            setLoading(false);
            return false;
          }
          return await fetchUserInfo();
        }
        throw new Error('사용자 정보를 가져오는데 실패했습니다.');
      }
      const data = await response.json();
      // 백엔드에서 전달하는 result 객체에 name, email 필드를 포함해야 합니다.
      setUser(data.result);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('사용자 정보 오류:', error);
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  // 토큰 재발급
  const refreshToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}api/v1/reissue/access-token`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getRefreshToken()}`,
        },
      });
      if (!response.ok) throw new Error('토큰 재발급에 실패했습니다.');
      await response.json();
      return true;
    } catch (error) {
      console.error('토큰 재발급 오류:', error);
      return false;
    }
  };

  // 로그아웃 처리
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}user/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('서버 로그아웃 오류:', err);
    }
    setUser(null);
    navigate('/');
  };

  // 쿠키에서 리프레시 토큰 꺼내기
  const getRefreshToken = () => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith('refreshToken=')) {
        return cookie.substring('refreshToken='.length);
      }
    }
    return null;
  };

  // 소셜 로그인 URL
  const getSocialLoginUrl = (provider) =>
    `${API_BASE_URL}oauth2/authorization/${provider}`;

  // 앱 초기 로드 시 유저 정보 확인
  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        signup,
        getSocialLoginUrl,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
