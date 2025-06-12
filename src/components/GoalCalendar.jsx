// src/components/GoalCalendar.jsx
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './GoalCalendar.css'; // CSS for achieved tiles

/**
 * achievedDates: 'YYYY-MM-DD' 형식의 문자열 배열 e.g. ['2025-06-10', '2025-06-11']
 */
export default function GoalCalendar({ achievedDates = [] }) {
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    setActiveStartDate(activeStartDate);
  };

  // 로컬 날짜를 'YYYY-MM-DD'로 포맷
  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // 달성일 타일에 클래스 추가
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dayKey = formatLocalDate(date);
      if (achievedDates.includes(dayKey)) {
        return 'achieved';
      }
    }
    return null;
  };

  // 달성일 타일 내부 콘텐츠
  const tileContent = ({ date, view }) => {
    if (view === 'month' && achievedDates.includes(formatLocalDate(date))) {
      return (
        <div className="achieved-circle">
          <span className="achieved-text">{date.getDate()}일</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="study-calendar text-black">
      <Calendar
        value={activeStartDate}
        onActiveStartDateChange={handleActiveStartDateChange}
        tileClassName={tileClassName}
        tileContent={tileContent}
      />
    </div>
  );
}

// 사용 예시:
// <GoalCalendar achievedDates={['2025-06-17','2025-06-18']} />