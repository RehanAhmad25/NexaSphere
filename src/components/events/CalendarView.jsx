import React, { useState, useMemo } from 'react';
import './CalendarView.css';

export default function CalendarView({ events, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const parseEventDate = (dateStr) => {
    if (!dateStr) return null;
    let normalized = dateStr;
    if (!/\d{4}/.test(dateStr)) {
      normalized = `${dateStr}, ${new Date().getFullYear()}`;
    }
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(ev => {
      const d = parseEventDate(ev.date);
      if (d) {
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map[key]) map[key] = [];
        map[key].push(ev);
      }
    });
    return map;
  }, [events]);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const blanks = Array.from({ length: firstDayOfMonth }).map((_, i) => (
    <div key={`blank-${i}`} className="calendar-cell blank"></div>
  ));

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  const days = Array.from({ length: daysInMonth }).map((_, i) => {
    const dateNum = i + 1;
    const isToday = isCurrentMonth && today.getDate() === dateNum;
    const key = `${currentYear}-${currentMonth}-${dateNum}`;
    const dayEvents = eventsByDate[key] || [];

    return (
      <div key={`day-${dateNum}`} className={`calendar-cell ${isToday ? 'today' : ''}`}>
        <div className="calendar-day-header">{dateNum}</div>
        <div className="calendar-day-events">
          {dayEvents.map(ev => {
            const isKSS = ev.id === 1 || ev.id === 'kss-153' || String(ev.shortName || '').toLowerCase().includes('kss');
            return (
              <div 
                key={ev.id} 
                className={`calendar-event-chip ${ev.status === 'completed' ? 'completed' : 'upcoming'} ${isKSS ? 'kss-event' : ''}`}
                onClick={() => onEventClick && onEventClick(ev)}
                title={ev.name}
              >
                <div className="event-chip-dot"></div>
                <span className="event-chip-title">{ev.shortName || ev.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  });

  return (
    <div className="calendar-container pop-in">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={prevMonth} aria-label="Previous Month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h2 className="calendar-title">{monthNames[currentMonth]} {currentYear}</h2>
        <button className="calendar-nav-btn" onClick={nextMonth} aria-label="Next Month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      <div className="calendar-grid">
        {daysOfWeek.map(d => (
          <div key={d} className="calendar-day-label">{d}</div>
        ))}
        {blanks}
        {days}
      </div>
    </div>
  );
}
