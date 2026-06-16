import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { customMonthNames, customDayNames } from '../config/calendarConfig';
import type { TimelineEvent, NPC } from '../types';

const eventTypeStyles: Record<string, string> = {
  quest: 'bg-amber-500 text-slate-950',
  combat: 'bg-rose-500 text-white',
  travel: 'bg-blue-500 text-white',
  downtime: 'bg-emerald-500 text-slate-950',
  npc: 'bg-purple-500 text-white',
  other: 'bg-slate-500 text-white',
};

export function EventListPanel() {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const {
    selectedDate,
    npcs,
    events,
    setEventSearchQuery,
    fetchEvents,
    loadFromSupabase,
    openEventModal,
    deleteEvent,
    filteredEventsByDate,
  } = useStore(
    useShallow((state) => ({
      selectedDate: state.selectedDate,
      npcs: state.npcs,
      events: state.events,
      setEventSearchQuery: state.setEventSearchQuery,
      fetchEvents: state.fetchEvents,
      loadFromSupabase: state.loadFromSupabase,
      openEventModal: state.openEventModal,
      deleteEvent: state.deleteEvent,
      filteredEventsByDate: state.filteredEventsByDate,
    }))
  );

  useEffect(() => {
    if (npcs.length === 0) {
      loadFromSupabase().catch((error) => console.warn('Failed to load NPCs:', error));
    }
  }, [npcs.length, loadFromSupabase]);

  useEffect(() => {
    if (events.length === 0) {
      fetchEvents().catch((error) => console.warn('Failed to fetch events:', error));
    }
  }, [events.length, fetchEvents]);

  const filteredEvents = useMemo(() => filteredEventsByDate(), [selectedDate, filteredEventsByDate]);

  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return new Date();
    return new Date(selectedDate);
  }, [selectedDate]);

  const selectedDayName = customDayNames[selectedDateObj.getDay()];
  const selectedMonthName = customMonthNames[selectedDateObj.getMonth()];
  const selectedDateLabel = `${selectedDayName}, ${String(selectedDateObj.getDate()).padStart(2, '0')} ${selectedMonthName} ${selectedDateObj.getFullYear()}`;

  const findNpcNames = (npcIds?: string[]) => {
    if (!npcIds || npcIds.length === 0) return [];
    return npcIds
      .map((npcId) => npcs.find((npc) => npc.id === npcId))
      .filter((npc): npc is NPC => Boolean(npc))
      .map((npc) => npc.name);
  };

  const handleToggle = (eventId: string) => {
    setExpandedEventId((current) => (current === eventId ? null : eventId));
  };

  const handleDelete = async (eventId: string, title: string) => {
    const confirmed = window.confirm(`Удалить событие "${title}"?`);
    if (!confirmed) return;

    try {
      await deleteEvent(eventId);
    } catch (error) {
      console.warn('Failed to delete event:', error);
      alert('Не удалось удалить событие. Попробуйте позже.');
    }
  };

  return (
    <aside className="min-w-[320px] rounded-2xl border border-slate-700 bg-slate-800 p-3 text-slate-100 shadow-lg">
      {/* Верхняя панель: Поиск + Кнопка + Дата */}
      <div className="mb-3 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex-1">
            <span className="sr-only">Поиск события</span>
            <input
              type="text"
              placeholder="Поиск события..."
              onChange={(e) => setEventSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
          <button
            type="button"
            onClick={() => openEventModal()}
            disabled={!selectedDate}
            className="inline-flex items-center justify-center rounded-xl border border-blue-500 bg-blue-500 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Добавить событие
          </button>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">События на</h2>
          <p className="mt-1 text-sm font-semibold text-slate-100">{selectedDateLabel}</p>
        </div>
      </div>

      {/* Список событий */}
      <div className="space-y-2">
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-center text-sm text-slate-400">
            Нет событий в этот день
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isExpanded = expandedEventId === event.id;
            const npcNames = findNpcNames(event.npc_ids);

            return (
              <div key={event.id} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70 shadow-sm">
                {/* Заголовок карточки (кликабельный) */}
                <button
                  type="button"
                  onClick={() => handleToggle(event.id)}
                  className="w-full px-3 py-3 text-left transition hover:bg-slate-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-1 flex-wrap items-center gap-1">
                      <h3 className="text-sm font-semibold text-slate-100">{event.title}</h3>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${eventTypeStyles[event.event_type]}`}>
                        {event.event_type}
                      </span>
                      {event.completed && (
                        <span className="rounded-full bg-slate-700 px-2 py-1 text-[11px] text-slate-300">
                          Завершено
                        </span>
                      )}
                    </div>
                    {/* Стрелка раскрытия */}
                    <svg
                      className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Раскрывающийся контент */}
                {isExpanded && (
                  <div className="border-t border-slate-700 px-3 py-3 text-sm text-slate-300">
                    <div className="mb-3">
                      <p className="mb-1 text-[11px] font-medium uppercase text-slate-500">Описание</p>
                      <p className="whitespace-pre-line text-slate-200 text-sm">{event.description || 'Описание отсутствует.'}</p>
                    </div>

                    <div className="mb-3">
                      <p className="mb-1 text-[11px] font-medium uppercase text-slate-500">Связанные НПС</p>
                      {npcNames.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {npcNames.map((name, idx) => (
                            <span key={`${name}-${idx}`} className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-200 border border-slate-700">
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-slate-500 italic text-sm">Нет связанных НПС</p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => openEventModal(event)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 transition"
                      >
                        Редактировать
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(event.id, event.title)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 transition"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}