import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import type { EventType, TimelineEvent } from '../types';

const eventTypeLabels: Record<EventType, string> = {
  quest: 'Задание',
  combat: 'Бой',
  travel: 'Путешествие',
  downtime: 'Отдых',
  npc: 'НПС',
  other: 'Прочее',
};

interface EventModalProps {
  onClose: () => void;
}

const initialFormState = {
  title: '',
  description: '',
  event_date: '',
  event_type: 'quest' as EventType,
  completed: false,
  npc_ids: [] as string[],
};

export default function EventModal({ onClose }: EventModalProps) {
  const {
    selectedDate,
    npcs,
    editingEvent,
    addEvent,
    updateEvent,
  } = useStore(
    useShallow((state) => ({
      selectedDate: state.selectedDate,
      npcs: state.npcs,
      editingEvent: state.editingEvent,
      addEvent: state.addEvent,
      updateEvent: state.updateEvent,
    }))
  );

  const [formData, setFormData] = useState(() => ({
    ...initialFormState,
    event_date: selectedDate || new Date().toISOString().slice(0, 10),
  }));
  const [errors, setErrors] = useState<{ title?: string; event_date?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description || '',
        event_date: editingEvent.event_date,
        event_type: editingEvent.event_type,
        completed: editingEvent.completed,
        npc_ids: editingEvent.npc_ids || [],
      });
      return;
    }

    setFormData((current) => ({
      ...current,
      event_date: selectedDate || new Date().toISOString().slice(0, 10),
    }));
  }, [editingEvent, selectedDate]);

  const handleChange = (field: keyof typeof formData, value: string | boolean | string[]) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const toggleNpc = (npcId: string) => {
    setFormData((current) => {
      const hasNpc = current.npc_ids.includes(npcId);
      return {
        ...current,
        npc_ids: hasNpc
          ? current.npc_ids.filter((id) => id !== npcId)
          : [...current.npc_ids, npcId],
      };
    });
  };

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!formData.title.trim()) {
      nextErrors.title = 'Заголовок обязателен';
    }

    if (!formData.event_date) {
      nextErrors.event_date = 'Дата события обязательна';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const eventData: Omit<TimelineEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      event_date: formData.event_date,
      event_type: formData.event_type,
      completed: formData.completed,
      npc_ids: formData.npc_ids,
    };

    setIsSaving(true);

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
      } else {
        await addEvent(eventData);
      }
      onClose();
    } catch (error) {
      console.warn('Failed to save timeline event:', error);
      alert('Не удалось сохранить событие. Попробуйте позже.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div className="form-modal-backdrop" />
      <div className="form-modal-panel max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="form-modal-header">
          <h2 className="form-modal-title">
            {editingEvent ? '✏️ Редактировать событие' : '✨ Новое событие'}
          </h2>
          <button type="button" onClick={onClose} className="form-modal-close-btn">
            ✕
          </button>
        </div>

        <div className="form-modal-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-modal-field">
              <label className="form-modal-label">Название события *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="form-modal-input"
                placeholder="Например: Похищение каравана"
              />
              {errors.title && <p className="form-modal-error">{errors.title}</p>}
            </div>

            <div className="form-modal-field">
              <label className="form-modal-label">Дата события *</label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => handleChange('event_date', e.target.value)}
                className="form-modal-input"
              />
              {errors.event_date && <p className="form-modal-error">{errors.event_date}</p>}
            </div>

            <div className="form-modal-field">
              <label className="form-modal-label">Тип события</label>
              <select
                value={formData.event_type}
                onChange={(e) => handleChange('event_type', e.target.value as EventType)}
                className="form-modal-select"
              >
                {Object.entries(eventTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-modal-field">
              <label className="form-modal-label">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="form-modal-textarea"
                rows={4}
                placeholder="Краткое описание события"
              />
            </div>

            <div className="form-modal-field">
              <label className="form-modal-label">Связанные НПС</label>
              <div className="grid gap-2 max-h-48 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-3">
                {npcs.length === 0 ? (
                  <p className="text-sm text-slate-400">Нет НПС в базе</p>
                ) : (
                  npcs.map((npc) => (
                    <label
                      key={npc.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm transition hover:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={formData.npc_ids.includes(npc.id)}
                        onChange={() => toggleNpc(npc.id)}
                        className="h-4 w-4 rounded accent-blue-500"
                      />
                      <span>{npc.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="form-modal-field">
              <label className="form-modal-label flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.completed}
                  onChange={(e) => handleChange('completed', e.target.checked)}
                  className="h-4 w-4 rounded accent-blue-500"
                />
                Завершено
              </label>
            </div>

            <div className="form-modal-footer">
              <button type="button" onClick={onClose} className="form-modal-btn form-modal-btn-secondary">
                Отмена
              </button>
              <button type="submit" disabled={isSaving} className="form-modal-btn form-modal-btn-primary">
                {isSaving ? 'Сохранение...' : editingEvent ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
