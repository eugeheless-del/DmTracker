import { useMemo } from 'react';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { customMonthNames, customDayNames } from '../config/calendarConfig';

export function CampaignCalendar() {
  const {
    calendarMonth,
    calendarYear,
    selectedDate,
    events,
    setSelectedDate,
    changeCalendarMonth,
  } = useStore(
    useShallow((state) => ({
      calendarMonth: state.calendarMonth,
      calendarYear: state.calendarYear,
      selectedDate: state.selectedDate,
      events: state.events,
      setSelectedDate: state.setSelectedDate,
      changeCalendarMonth: state.changeCalendarMonth,
    }))
  );

  const monthDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    return Array.from({ length: 42 }, (_, index) => {
      const dayNumber = index - firstDay + 1;
      return dayNumber >= 1 && dayNumber <= daysInMonth ? dayNumber : null;
    });
  }, [calendarMonth, calendarYear]);

  const eventDateSet = useMemo(() => {
    return new Set(events.map((event) => event.event_date));
  }, [events]);

  const formatIsoDate = (dayNumber: number) => {
    const month = String(calendarMonth + 1).padStart(2, '0');
    const day = String(dayNumber).padStart(2, '0');
    return `${calendarYear}-${month}-${day}`;
  };

  return (
    <section className="w-full h-full rounded-2xl border border-slate-700 bg-slate-800 p-2 text-slate-100 shadow-lg">
      <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-2">
        <button
          type="button"
          onClick={() => changeCalendarMonth(-1)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 transition hover:bg-slate-700"
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="text-center text-xs font-semibold tracking-tight text-slate-100">
          {customMonthNames[calendarMonth]} {calendarYear}
        </div>

        <button
          type="button"
          onClick={() => changeCalendarMonth(1)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 transition hover:bg-slate-700"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 px-0 pt-2 text-[10px] uppercase tracking-tight text-slate-400">
        {customDayNames.map((dayName) => (
          <div key={dayName} className="w-full text-center py-1">
            {dayName}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 pt-2">
        {monthDays.map((dayNumber, index) => {
          if (dayNumber === null) {
            return (
              <div key={index} className="min-h-[40px] rounded-lg border border-slate-700 bg-slate-900/40" />
            );
          }

          const isoDate = formatIsoDate(dayNumber);
          const isSelected = isoDate === selectedDate;
          const hasEvent = eventDateSet.has(isoDate);

          return (
            <button
              key={isoDate}
              type="button"
              onClick={() => setSelectedDate(isoDate)}
              className={`min-h-[40px] rounded-lg border p-1 text-left text-xs transition hover:bg-slate-700 ${
                isSelected
                  ? 'border-blue-500 bg-blue-900/50'
                  : 'border-slate-700 bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{dayNumber}</span>
                {hasEvent && <span className="h-2 w-2 rounded-full bg-blue-500" />}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
