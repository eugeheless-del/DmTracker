import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '../store';
import MapImageUpload from './MapImageUpload';
import type { Location, NPC } from '../types';

interface LocationModalProps {
  location?: Location | null;
  onClose: () => void;
  onSaved?: () => void;
}

interface LocationFormState {
  name: string;
  description: string;
  image_url: string;
}

const initialFormState: LocationFormState = {
  name: '',
  description: '',
  image_url: '',
};

const isSameArray = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export default function LocationModal({ location, onClose, onSaved }: LocationModalProps) {
  const { npcs, addLocation, updateLocation, getLocationImageUrl } = useStore(
    useShallow((state) => ({
      npcs: state.npcs,
      addLocation: state.addLocation,
      updateLocation: state.updateLocation,
      getLocationImageUrl: state.getLocationImageUrl,
    }))
  );

  const [formData, setFormData] = useState<LocationFormState>(initialFormState);
  const [selectedNpcIds, setSelectedNpcIds] = useState<string[]>(location?.linked_npc_ids || []);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        description: location.description || '',
        image_url: location.image_url || '',
      });
      setSelectedFile(null);

      const locationNpcIds = location.linked_npc_ids || [];
      if (!isSameArray(locationNpcIds, selectedNpcIds)) {
        setSelectedNpcIds(locationNpcIds);
      }
      return;
    }

    setFormData(initialFormState);
    setSelectedNpcIds([]);
  }, [location]);

  const handleChange = (field: keyof LocationFormState, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (error) setError('');
  };

  const toggleNpc = (npcId: string) => {
    setSelectedNpcIds((current) =>
      current.includes(npcId)
        ? current.filter((id) => id !== npcId)
        : [...current, npcId]
    );
  };

  const removeNpcTag = (npcId: string) => {
    setSelectedNpcIds((current) => current.filter((id) => id !== npcId));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError('Название обязательно');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      linked_npc_ids: selectedNpcIds,
      file: selectedFile || undefined,
    };

    setIsSaving(true);

    try {
      if (location) {
        await updateLocation(location.id, payload);
      } else {
        await addLocation(payload);
      }

      onSaved?.();
      onClose();
    } catch (saveError) {
      console.warn('Failed to save location:', saveError);
      setError('Не удалось сохранить локацию. Попробуйте снова.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/70"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-300/80">Локация</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-100">
              {location ? 'Редактировать локацию' : 'Новая локация'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="location-name">
              Название локации *
            </label>
            <input
              id="location-name"
              value={formData.name}
              onChange={(event) => handleChange('name', event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Например, Заброшенный форт"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="location-description">
              Описание
            </label>
            <textarea
              id="location-description"
              value={formData.description}
              onChange={(event) => handleChange('description', event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Кратко опишите эту локацию"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="location-image-upload">
              Изображение локации
            </label>
            <MapImageUpload
              existingImageUrl={location?.image_url ? getLocationImageUrl(location.image_url) : undefined}
              onFileSelect={(file) => setSelectedFile(file)}
              disabled={isSaving}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-300">Выберите НПС</label>
              <span className="text-xs text-slate-500">{selectedNpcIds.length} выбрано</span>
            </div>
            <div className="mt-3 grid gap-2 max-h-56 overflow-y-auto rounded-3xl border border-slate-700 bg-slate-950 p-3">
              {npcs?.length === 0 ? (
                <p className="text-sm text-slate-500">Сначала добавьте НПС в общий список</p>
              ) : (
                npcs?.map((npc) => {
                  const selected = selectedNpcIds.includes(npc.id);
                  return (
                    <button
                      key={npc.id}
                      type="button"
                      onClick={() => toggleNpc(npc.id)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        selected
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-100'
                          : 'border-slate-700 bg-slate-900 text-slate-100 hover:border-emerald-400 hover:bg-slate-800'
                      }`}
                    >
                      <span>{npc.name}</span>
                      <span className="text-xs text-slate-400">{selected ? 'Выбрано' : 'Добавить'}</span>
                    </button>
                  );
                })
              )}
            </div>

            {selectedNpcIds.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedNpcIds.map((npcId) => {
                  const npc = npcs?.find((item) => item.id === npcId);
                  if (!npc) return null;

                  return (
                    <span
                      key={npcId}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-100"
                    >
                      {npc.name}
                      <button
                        type="button"
                        onClick={() => removeNpcTag(npcId)}
                        className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-100 transition hover:bg-emerald-400/25"
                        aria-label={`Удалить ${npc.name}`}
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Сохраняем...' : location ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  );
}
