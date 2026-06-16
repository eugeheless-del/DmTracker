import { useStore } from '../store';
import MapsList from '../components/MapsList';
import MapViewer from '../components/MapViewer';

export default function Maps() {
  const activeMap = useStore((state) => state.activeMap);
  const setActiveMap = useStore((state) => state.setActiveMap);

  return (
    <div className="space-y-6">
      {activeMap === null ? (
        <MapsList onOpenMap={() => {}} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-700 bg-slate-900/90 p-4 shadow-sm shadow-slate-950/20">
            <button
              type="button"
              onClick={() => setActiveMap(null)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:bg-slate-900"
            >
              ← Назад к картам
            </button>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Текущая карта</p>
              <h1 className="text-2xl font-semibold text-slate-100">{activeMap.name}</h1>
            </div>
          </div>
          <MapViewer map={activeMap} />
        </div>
      )}
    </div>
  );
}
