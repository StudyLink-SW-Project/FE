import React, { createContext, useState, useEffect, useContext } from 'react';

// GoalContext: 목표 공부 시간을 전역으로 관리하기 위한 Context
const StudyContext = createContext();

// Provider 컴포넌트
export function StudyProvider({ children }) {
  const API = import.meta.env.VITE_APP_SERVER;
  const [goalHours, setGoalHours] = useState(0);
  const [goalMinutes, setGoalMinutes] = useState(0);

  // 오늘 공부 시간(분), 총 공부 시간(분)
  const [todayTime, setTodayTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // 1) 목표 시간 로드
  useEffect(() => {
    async function fetchGoal() {
      try {
        const res = await fetch(`${API}study/time`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('목표 시간 불러오기 실패');
        const data = await res.json();
        if (data.isSuccess && data.result) {
          const { goalStudyTime, todayStudyTime, totalStudyTime } = data.result;
          // 목표 시간 파싱
          const hourMatch = goalStudyTime.match(/(\d+)\s*시간/);
          const minMatch = goalStudyTime.match(/(\d+)\s*분/);
          setGoalHours(hourMatch ? Number(hourMatch[1]) : 0);
          setGoalMinutes(minMatch ? Number(minMatch[1]) : 0);
          // 오늘·총 공부 시간 파싱(“X시간 Y분” 형태 가정)
          const parse = str => {
            const h = (str.match(/(\d+)\s*시간/) || [0,0])[1];
            const m = (str.match(/(\d+)\s*분/)   || [0,0])[1];
            return Number(h) * 60 + Number(m);
          };
          setTodayTime(parse(todayStudyTime));
          setTotalTime(parse(totalStudyTime));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchGoal();
  }, [API]);

  return (
    <StudyContext.Provider value={{ goalHours, goalMinutes, setGoalHours, setGoalMinutes, setTodayTime, todayTime, totalTime, }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy는 StudyProvider 안에서만 사용 가능합니다');
  return ctx;
}