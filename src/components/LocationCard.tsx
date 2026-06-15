import type { Location, NPC } from '../types';

interface LocationCardProps {
  location: Location;
  npcs?: NPC[];
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
}

export default function LocationCard({ location, npcs, onEdit, onDelete }: LocationCardProps) {
  const linkedNpcs = (location.linked_npc_ids || [])
    .map((id) => npcs?.find((npc) => npc.id === id))
    .filter(Boolean) as NPC[];

  const description = location.description?.trim() || 'Описание отсутствует';
  const shortDescription = description.length > 120 ? `${description.slice(0, 120)}…` : description;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-sm shadow-slate-950/30 transition hover:border-emerald-400">
      <div className="h-48 overflow-hidden bg-slate-800">
        {location.image_url ? (
          <img
            src={location.image_url}
            alt={location.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-800 text-sm text-slate-500">
            Изображение отсутствует
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-xl font-semibold text-slate-100">{location.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{shortDescription}</p>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">НПС</div>
          {linkedNpcs.length > 0 ? (
            <p className="text-sm text-slate-300">
              {linkedNpcs.map((npc) => npc.name).join(', ')}
            </p>
          ) : (
            <p className="text-sm text-slate-500">Нет связанных НПС</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(location)}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:bg-slate-900"
          >
            Редактировать
          </button>
          <button
            type="button"
            onClick={() => onDelete(location)}
            className="inline-flex items-center justify-center rounded-2xl border border-red-500 bg-red-600/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-600/20"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
