import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { supabase } from '../supabaseClient';
import type { MapItem } from '../types';
import MapImageUpload from './MapImageUpload';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingMap?: MapItem | null;
}

const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error('User not authenticated');

  return user;
};

export default function MapModal({ isOpen, onClose, onSaved, editingMap }: MapModalProps) {
  const fetchMaps = useStore((state) => state.fetchMaps);
  const uploadMapImage = useStore((state) => state.uploadMapImage);
  const updateMap = useStore((state) => state.updateMap);
  const deleteMapImage = useStore((state) => state.deleteMapImage);
  const getMapImageUrl = useStore((state) => state.getMapImageUrl);

  const [name, setName] = useState(editingMap?.name || '');
  const [description, setDescription] = useState(editingMap?.description || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setName(editingMap?.name || '');
    setDescription(editingMap?.description || '');
    setSelectedFile(null);
    setError('');
  }, [isOpen, editingMap]);

  const existingImageUrl = editingMap?.image_url ? getMapImageUrl(editingMap.image_url) : undefined;

  const handleSubmit = async () => {
    setError('');

    if (!name.trim()) {
      setError('Название карты обязательно.');
      return;
    }

    if (!editingMap && !selectedFile) {
      setError('Выберите файл карты.');
      return;
    }

    setUploading(true);

    try {
      const user = await getCurrentUser();
      const createdAt = new Date().toISOString();

      if (editingMap) {
          const updatePayload: Partial<MapItem> = {
            name: name.trim(),
            description: description.trim() || undefined,
          };

          if (selectedFile) {
            const imagePath = `${user.id}/${editingMap.id}/${selectedFile.name}`;
            await uploadMapImage(user.id, editingMap.id, selectedFile);
            await updateMap(editingMap.id, { ...updatePayload, image_url: imagePath });
          } else {
            await updateMap(editingMap.id, updatePayload);
          }

          await fetchMaps();
          onSaved();
          onClose();
          return;
        }
      const recordId = crypto.randomUUID();
      let imagePath = '';

      if (selectedFile) {
        imagePath = `${user.id}/${recordId}/${selectedFile.name}`;
        await uploadMapImage(user.id, recordId, selectedFile);
      }

      const { data: insertedMap, error: insertError } = await supabase
        .from('maps')
        .insert([
          {
            id: recordId,
            name: name.trim(),
            description: description.trim() || undefined,
            image_url: imagePath,
            user_id: user.id,
            created_at: createdAt,
          },
        ])
        .select('*')
        .single();

      if (insertError) {
        if (imagePath) {
          await deleteMapImage(imagePath).catch(() => undefined);
        }
        throw insertError;
      }

      await fetchMaps();
      onSaved();
      onClose();
    } catch (saveError) {
      console.warn('Failed to save map:', saveError);
      setError('Не удалось сохранить карту. Попробуйте ещё раз.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              {editingMap ? 'Редактировать карту' : 'Новая карта'}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-100">
              {editingMap ? 'Обновить карту' : 'Добавить карту'}
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
            <label className="block text-sm font-medium text-slate-300">Название карты</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Например, Храм Теней"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Описание (необязательно)</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Краткое описание карты"
            />
          </div>

          <MapImageUpload
            existingImageUrl={existingImageUrl}
            onFileSelect={(file) => setSelectedFile(file)}
            disabled={uploading}
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={uploading}
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? 'Сохраняем…' : editingMap ? 'Сохранить изменения' : 'Создать карту'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400 hover:bg-slate-900"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
