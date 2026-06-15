import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store';
import type { MapItem, MapPin } from '../types';

interface MapViewerProps {
  map: MapItem;
}

interface PendingCoords {
  x: number;
  y: number;
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export default function MapViewer({ map }: MapViewerProps) {
  const [pendingCoords, setPendingCoords] = useState<PendingCoords | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [isSavingPin, setIsSavingPin] = useState(false);

  const { mapPins, isMapEditMode, locations, npcs, addPin, deletePin, fetchMapPins, toggleMapEditMode } = useStore(
    useShallow((state) => ({
      mapPins: state.mapPins,
      isMapEditMode: state.isMapEditMode,
      locations: state.locations,
      npcs: state.npcs,
      addPin: state.addPin,
      deletePin: state.deletePin,
      fetchMapPins: state.fetchMapPins,
      toggleMapEditMode: state.toggleMapEditMode,
    }))
  );

  const displayedPins = mapPins.filter((pin) => pin.map_id === map.id);

  const getNpcNames = (ids?: string[]) => {
    if (!ids?.length) return [];
    return ids
      .map((id) => npcs.find((npc) => npc.id === id)?.name)
      .filter((name): name is string => Boolean(name));
  };

  useEffect(() => {
    if (!map?.id) return;
    fetchMapPins(map.id).catch((error) => console.warn('Failed to load map pins:', error));
    setHoveredPinId(null);
    setSelectedPin(null);
  }, [fetchMapPins, map.id]);

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!isMapEditMode) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
    const y = clampPercent(((event.clientY - rect.top) / rect.height) * 100);

    setPendingCoords({ x, y });
    setSelectedLocationId(locations[0]?.id ?? '');
    setHoveredPinId(null);
    setSelectedPin(null);
  };

  const handleSavePin = async () => {
    if (!pendingCoords || !selectedLocationId) return;

    try {
      setIsSavingPin(true);
      await addPin(map.id, selectedLocationId, pendingCoords.x, pendingCoords.y);
      setPendingCoords(null);
      setSelectedLocationId('');
    } catch (error) {
      console.warn('Failed to save pin:', error);
    } finally {
      setIsSavingPin(false);
    }
  };

  const handleCancelPin = () => {
    setPendingCoords(null);
    setSelectedLocationId('');
  };

  const handlePinClick = (pin: MapPin) => {
    setSelectedPin((current) => (current?.id === pin.id ? null : pin));
  };

  const handleDeletePin = async (pinId: string) => {
    try {
      await deletePin(pinId);
      setSelectedPin((current) => (current?.id === pinId ? null : current));
    } catch (error) {
      console.warn('Failed to delete pin:', error);
    }
  };

  return (
    <div className="flex h-full gap-4 p-4">
      <div className="flex-1 flex flex-col min-w-0 gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Карта</p>
            <h2 className="text-2xl font-semibold text-white">{map.name}</h2>
          </div>
          <button
            type="button"
            onClick={toggleMapEditMode}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              isMapEditMode
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
            }`}
          >
            {isMapEditMode
              ? '️ Режим редактирования (нажми для просмотра)'
              : '👁 Режим просмотра (нажми для расстановки)'}
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
          <img
            src={map.image_url}
            alt={map.name}
            className="block w-full h-auto"
            onClick={handleImageClick}
          />

          {displayedPins.map((pin) => (
            <div
              key={pin.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pin.x_coord}%`, top: `${pin.y_coord}%` }}
            >
              {hoveredPinId === pin.id && (
                <div
                  className="absolute z-30 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg border border-slate-600 whitespace-nowrap -translate-x-1/2 -translate-y-full mb-2 opacity-100 transition-opacity duration-200"
                  style={{ left: '50%', top: '0%' }}
                >
                  {pin.location?.name || 'Локация удалена'}
                </div>
              )}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handlePinClick(pin);
                }}
                onMouseEnter={() => setHoveredPinId(pin.id)}
                onMouseLeave={() => setHoveredPinId(null)}
                className="relative z-20 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-950/40 transition-transform duration-200 hover:scale-125"
                aria-label={`Пин ${pin.id}`}
              >
                📍
              </button>

              {isMapEditMode && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeletePin(pin.id);
                  }}
                  className="absolute right-0 top-0 z-30 -translate-y-1/2 translate-x-1/2 rounded-full bg-slate-900/95 px-2 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-600"
                  aria-label="Удалить пин"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {pendingCoords && (
            <div
              className="absolute z-40 -translate-x-1/2 rounded-3xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl shadow-black/40"
              style={{ left: `${pendingCoords.x}%`, top: `${pendingCoords.y}%`, transform: 'translate(-50%, -120%)' }}
            >
              <div className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Выберите локацию
              </div>
              {locations.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-400">
                  Нет доступных локаций
                </p>
              ) : (
                <select
                  value={selectedLocationId}
                  onChange={(event) => setSelectedLocationId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
                >
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSavePin}
                  disabled={!selectedLocationId || isSavingPin}
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingPin ? 'Сохраняем…' : 'Добавить'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelPin}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:bg-slate-900"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          {selectedPin && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="relative w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/60 max-h-[80vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setSelectedPin(null)}
                  className="absolute right-4 top-4 text-slate-400 transition hover:text-white"
                  aria-label="Закрыть"
                >
                  ✕
                </button>
                <h3 className="text-xl font-bold text-white mb-2">{selectedPin.location?.name || 'Локация удалена'}</h3>
                {selectedPin.location?.image_url ? (
                  <img src={selectedPin.location.image_url} alt={selectedPin.location?.name || ''} className="mb-3 h-32 w-full rounded-lg object-cover" />
                ) : null}
                <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                  {selectedPin.location?.description || 'Нет описания'}
                </p>
                {(selectedPin.location?.linked_npc_ids?.length || 0) > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-500 font-semibold mb-2">СВЯЗАННЫЕ НПС</p>
                    <div className="flex flex-wrap gap-2">
                      {getNpcNames(selectedPin.location.linked_npc_ids).map((name, idx) => (
                        <span key={idx} className="bg-slate-800 text-emerald-400 text-xs px-2 py-1 rounded border border-slate-700">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="w-80 flex-shrink-0 overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Пины на карте ({displayedPins.length})</h3>
        {displayedPins.length === 0 ? (
          <p className="text-slate-400 text-sm">Нет размещённых локаций</p>
        ) : (
          displayedPins.map((pin) => (
            <div
              key={pin.id}
              className="mb-2 flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 p-3 transition hover:border-blue-500"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">
                  {pin.location?.name || 'Локация удалена'}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  X: {pin.x_coord.toFixed(1)}% | Y: {pin.y_coord.toFixed(1)}%
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeletePin(pin.id)}
                className="text-slate-400 transition hover:text-red-400"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </aside>
    </div>
  );
}
