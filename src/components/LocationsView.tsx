import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store';
import type { Location } from '../types';
import LocationCard from './LocationCard';
import LocationModal from './LocationModal';

export default function LocationsView() {
  const { locations, npcs, fetchLocations, deleteLocation } = useStore(
    useShallow((state) => ({
      locations: state.locations,
      npcs: state.npcs,
      fetchLocations: state.fetchLocations,
      deleteLocation: state.deleteLocation,
    }))
  );

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations().catch((error) => {
      console.warn('Failed to load locations:', error);
    });
  }, [fetchLocations]);

  const openNewLocation = () => {
    setSelectedLocation(null);
    setIsModalOpen(true);
  };

  const openEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };

  const handleDeleteLocation = async (location: Location) => {
    if (!window.confirm(`Удалить локацию «${location.name}»?`)) {
      return;
    }

    try {
      setDeletingId(location.id);
      await deleteLocation(location.id);
    } catch (error) {
      console.warn('Failed to delete location:', error);
      alert('Не удалось удалить локацию. Попробуйте снова.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Локации</h1>
          <p className="text-sm text-slate-400">Управляйте местами приключений и связывайте их с персонажами.</p>
        </div>

        <button
          type="button"
          onClick={openNewLocation}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/95 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:bg-slate-800"
        >
          + Создать локацию
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-lg shadow-slate-950/20">
          <p className="mb-4 text-xl font-semibold text-slate-100">Пока нет локаций</p>
          <p className="mb-6 text-sm text-slate-400">Создайте новую локацию, чтобы начать строить мир.</p>
          <button
            type="button"
            onClick={openNewLocation}
            className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Создать локацию
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              npcs={npcs}
              onEdit={openEditLocation}
              onDelete={handleDeleteLocation}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <LocationModal
          location={selectedLocation}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => fetchLocations().catch((error) => console.warn('Failed to refresh locations:', error))}
        />
      )}
    </div>
  );
}
