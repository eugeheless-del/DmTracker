import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { CampaignCalendar } from '../components/CampaignCalendar';
import { EventListPanel } from '../components/EventListPanel';
import EventModal from '../components/EventModal';

export default function CampaignTimeline() {
  const {
    events,
    npcs,
    isEventModalOpen,
    closeEventModal,
    timelineEventsLoaded,
    fetchEvents,
    loadFromSupabase,
  } = useStore();

  // Флаг, чтобы загрузить данные только один раз
  const isDataLoadedRef = useRef(false);

  useEffect(() => {
    // Если уже загружали или данные уже есть — выходим
    if (isDataLoadedRef.current || timelineEventsLoaded) return;
    
    isDataLoadedRef.current = true;
    
    // Загружаем события
    fetchEvents().catch((err) => console.error('Failed to load events:', err));
    
    // Загружаем НПС, если их нет
    if (npcs.length === 0) {
      loadFromSupabase().catch((err) => console.error('Failed to load NPCs:', err));
    }
  }, []); // <-- ПУСТОЙ МАССИВ! Срабатывает только при монтировании

  return (
    <div className="flex h-full w-full overflow-hidden overflow-x-hidden gap-2 p-2 bg-slate-950/50">
      {!timelineEventsLoaded ? (
        <div className="flex h-full min-h-0 w-full items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 text-slate-400">
          Загрузка хронологии...
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 overflow-hidden w-full">
          <div className="flex-1 min-w-0 flex flex-col gap-2 overflow-hidden">
            <div className="flex flex-1 gap-2 min-h-0">
              <div className="flex-1 min-w-0 h-full overflow-hidden">
                <CampaignCalendar />
              </div>
              <div className="flex-1 min-w-0 h-full overflow-y-auto">
                <EventListPanel />
              </div>
            </div>
          </div>
        </div>
      )}

      {isEventModalOpen && <EventModal onClose={closeEventModal} />}
    </div>
  );
}