import React, { createContext, useState, useEffect, useContext } from 'react';

// GoalContext: 목표 공부 시간을 전역으로 관리하기 위한 Context
const GoalContext = createContext();

// Provider 컴포넌트
export function GoalProvider({ children }) {
  const API = import.meta.env.VITE_APP_SERVER;
  const [goalHours, setGoalHours] = useState(0);
  const [goalMinutes, setGoalMinutes] = useState(0);

  // 초기 목표 시간 불러오기
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
          const { goalStudyTime } = data.result;
          // "X시간 Y분", "X시간", "Y분" 등 다양한 형식 파싱
          const hourMatch = goalStudyTime.match(/(\d+)\s*시간/);
          const minMatch = goalStudyTime.match(/(\d+)\s*분/);
          setGoalHours(hourMatch ? Number(hourMatch[1]) : 0);
          setGoalMinutes(minMatch ? Number(minMatch[1]) : 0);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchGoal();
  }, [API]);

  return (
    <GoalContext.Provider value={{ goalHours, goalMinutes, setGoalHours, setGoalMinutes }}>
      {children}
    </GoalContext.Provider>
  );
}

// 커스텀 Hook
export function useGoal() {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoal must be used within a GoalProvider');
  }
  return context;
}