import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store';
import type { MapItem } from '../types';

interface MapsListProps {
  onOpenMap?: () => void;
}

export default function MapsList({ onOpenMap }: MapsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { maps, fetchMaps, addMap, setActiveMap } = useStore(
    useShallow((state) => ({
      maps: state.maps,
      fetchMaps: state.fetchMaps,
      addMap: state.addMap,
      setActiveMap: state.setActiveMap,
    }))
  );

  useEffect(() => {
    fetchMaps().catch((fetchError) => {
      console.warn('Failed to load maps:', fetchError);
    });
  }, [fetchMaps]);

  const handleOpenMap = (map: MapItem) => {
    setActiveMap(map);
    onOpenMap?.();
  };

  const handleCreateMap = async () => {
    if (!name.trim() || !imageUrl.trim()) {
      setError('Название и ссылка на изображение обязательны.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await addMap(name.trim(), imageUrl.trim());
      setName('');
      setImageUrl('');
      setIsModalOpen(false);
    } catch (createError) {
      console.warn('Failed to create map:', createError);
      setError('Не удалось создать карту. Попробуйте снова.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-700 bg-slate-900/90 p-5 shadow-sm shadow-slate-950/20 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Карты</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-100">Управление картами</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Создавайте новые карты и открывайте их для расстановки пинов. В режиме редактирования вы можете размещать маркеры на карте.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
        >
          Добавить карту
        </button>
      </div>

      {maps.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
          <p className="text-lg font-semibold text-slate-100">Список карт пуст</p>
          <p className="mt-2 text-sm text-slate-500">Создайте первую карту, чтобы начать расстановку пинов.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {maps.map((map) => (
            <article
              key={map.id}
              className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-sm shadow-slate-950/20"
            >
              <div className="h-48 overflow-hidden bg-slate-800">
                <img
                  src={map.image_url}
                  alt={map.name}
                  className="h-full w-full object-cover transition duration-200 hover:scale-105"
                />
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">{map.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {map.description || 'Описание отсутствует'}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenMap(map)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:bg-slate-900"
                  >
                    Открыть
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Новая карта</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">Добавить карту</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300">Название карты</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Например, Бой в сердце храма"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">URL изображения</label>
                <input
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="https://example.com/map.jpg"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleCreateMap}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Сохраняем…' : 'Создать карту'}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:bg-slate-900"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
