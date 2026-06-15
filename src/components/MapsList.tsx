import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store';
import type { MapItem } from '../types';
import MapModal from './MapModal';

interface MapsListProps {
  onOpenMap?: () => void;
}

export default function MapsList({ onOpenMap }: MapsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMap, setEditingMap] = useState<MapItem | null>(null);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const fetchedRef = useRef(false);

  const { maps, mapsLoading, fetchMaps, setActiveMap, getMapImageUrl, deleteMap } = useStore(
    useShallow((state) => ({
      maps: state.maps,
      mapsLoading: state.mapsLoading,
      fetchMaps: state.fetchMaps,
      setActiveMap: state.setActiveMap,
      getMapImageUrl: state.getMapImageUrl,
      deleteMap: state.deleteMap,
    }))
  );

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchMaps().catch((fetchError) => {
      console.warn('Failed to load maps:', fetchError);
      setError('Не удалось загрузить карты. Попробуйте обновить страницу.');
    });
  }, []);

  useEffect(() => {
    setLoadingImages(maps.reduce((acc, map) => ({ ...acc, [map.id]: true }), {}));
  }, [maps]);

  const openCreateModal = () => {
    setEditingMap(null);
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMap(null);
  };

  const handleModalSaved = () => {
    closeModal();
    setError('');
  };

  const handleOpenMap = (map: MapItem) => {
    setActiveMap(map);
    onOpenMap?.();
  };

  const handleEditMap = (map: MapItem) => {
    setEditingMap(map);
    setError('');
    setIsModalOpen(true);
  };

  const handleDeleteMap = async (map: MapItem) => {
    setError('');
    setIsDeleting(true);

    try {
      await deleteMap(map.id);
    } catch (deleteError) {
      console.warn('Failed to delete map:', deleteError);
      setError('Не удалось удалить карту. Попробуйте снова.');
    } finally {
      setIsDeleting(false);
    }
  };

  const markImageLoaded = (mapId: string) => {
    setLoadingImages((prev) => ({ ...prev, [mapId]: false }));
  };

  const markImageError = (mapId: string) => {
    setLoadingImages((prev) => ({ ...prev, [mapId]: false }));
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
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
        >
          Добавить карту
        </button>
      </div>

      {error && <p className="rounded-2xl border border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      {maps.length === 0 && mapsLoading ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />
          <p className="text-lg font-semibold text-slate-100">Загрузка карт...</p>
          <p className="mt-2 text-sm text-slate-500">Подождите, данные загружаются.</p>
        </div>
      ) : maps.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-8 text-center text-slate-400">
          <p className="text-lg font-semibold text-slate-100">Список карт пуст</p>
          <p className="mt-2 text-sm text-slate-500">Создайте первую карту, чтобы начать расстановку пинов.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {maps.map((map) => {
            const imageSrc = map.image_url ? getMapImageUrl(map.image_url) : '';
            const isLoading = loadingImages[map.id];

            return (
              <article
                key={map.id}
                className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-sm shadow-slate-950/20"
              >
                <div className="relative h-48 overflow-hidden bg-slate-800">
                  {isLoading && (
                    <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/80">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />
                    </div>
                  )}
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={map.name}
                      className="h-full w-full object-cover transition duration-200 hover:scale-105"
                      onLoad={() => markImageLoaded(map.id)}
                      onError={() => markImageError(map.id)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-950 text-sm text-slate-500">
                      Нет изображения
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-100">{map.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {map.description || 'Описание отсутствует'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenMap(map)}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:bg-slate-900"
                    >
                      Открыть
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditMap(map)}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-400 hover:bg-slate-900"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMap(map)}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-red-300 transition hover:border-red-400 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <MapModal isOpen={isModalOpen} onClose={closeModal} onSaved={handleModalSaved} editingMap={editingMap} />
    </section>
  );
}
