'use client';

import { useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  className: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
}

export default function Calendar({ events, onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDayEvents = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="h-24 bg-gray-50 rounded" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dayEvents = getDayEvents(day);
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={day}
              onClick={() => onDateSelect(date)}
              className={`h-24 p-1 border rounded cursor-pointer hover:bg-gray-50 ${
                isToday ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <div className="text-right">
                <span className={`text-sm ${isToday ? 'font-bold text-blue-500' : ''}`}>
                  {day}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate ${event.className}`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 