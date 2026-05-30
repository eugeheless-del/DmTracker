import { FormEvent, useEffect, useState } from 'react';
import { useStore } from '../store';
import { Location } from '../types';

function Locations() {
  const { locations, addLocation, deleteLocation, loadLocations } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadLocations().catch((error) => {
      console.warn('Failed to load locations:', error);
    });
  }, [loadLocations]);

  useEffect(() => {
    if (!showModal) {
      setName('');
      setError('');
    }
  }, [showModal]);

  useEffect(() => {
    if (!showModal) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  const handleAddSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Название локации не может быть пустым');
      return;
    }

    try {
      setIsSaving(true);
      await addLocation({ name: name.trim() });
      setShowModal(false);
    } catch (error) {
      setError('Не удалось создать локацию. Попробуйте снова.');
      console.warn('Failed to add location:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (location: Location) => {
    if (!window.confirm(`Удалить локацию «${location.name}»?`)) {
      return;
    }

    try {
      setDeletingId(location.id);
      await deleteLocation(location.id);
    } catch (error) {
      alert('Ошибка при удалении локации. Попробуйте снова.');
      console.warn('Failed to delete location:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Локации ({locations.length})</h2>
          <p className="text-sm text-slate-400">Создавайте места, где происходят приключения и твисты.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/95 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-400 hover:bg-slate-800"
        >
          + Добавить локацию
        </button>
      </div>

      {locations.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-lg shadow-slate-950/20">
          <p className="mb-4 text-xl font-semibold text-slate-100">Пока нет локаций</p>
          <p className="mb-6 text-sm text-slate-400">Добавьте первую локацию, чтобы начать организовывать мир.</p>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-2xl bg-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-blue-400"
          >
            Добавить локацию
          </button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <div
              key={location.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm transition hover:border-blue-400 hover:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">{location.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{location.description || 'Описание отсутствует'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(location)}
                  disabled={deletingId === location.id}
                  className="invisible rounded-full border border-red-500 bg-red-600/10 px-3 py-2 text-red-300 transition group-hover:visible hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === location.id ? 'Удаление...' : 'Удалить'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <form
            onSubmit={handleAddSubmit}
            className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/60"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-blue-300">Новая локация</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-100">Добавить локацию</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-200" htmlFor="location-name">
                Название локации
              </label>
              <input
                id="location-name"
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Например, Тайный лес"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-2xl border border-slate-700 bg-slate-900/95 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Сохраняем...' : 'Добавить'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Locations;
