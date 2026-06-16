import { useState } from 'react';
import { Session, PC } from '../types';
import ReactMarkdown from 'react-markdown';

interface SessionFormProps {
  // Editing session (undefined when creating new)
  session?: Session;
  // List of available player characters
  availablePCs: PC[];
  // Callback on form submit
  onSubmit: (data: any) => Promise<void>;
  // Callback on close
  onClose: () => void;
}

export function SessionForm({ session, availablePCs, onSubmit, onClose }: SessionFormProps) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    date: string;
    notes: string;
    pc_ids: string[];
    npc_ids: string[];
    twist_ids: string[];
  }>(() => {
    if (session) {
      return {
        name: session.name || '',
        description: session.description || '',
        date: session.date ? session.date.split('T')[0] : '',
        notes: session.notes || '',
        pc_ids: Array.isArray(session.pc_ids) ? session.pc_ids : [],
        npc_ids: Array.isArray(session.npc_ids) ? session.npc_ids : [],
        twist_ids: Array.isArray(session.twist_ids) ? session.twist_ids : [],
      };
    }
    return {
      name: '',
      description: '',
      date: '',
      notes: '',
      pc_ids: [],
      npc_ids: [],
      twist_ids: [],
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const processedValue = name === 'date' ? value.split('T')[0] : value;
    setFormData({ ...formData, [name]: processedValue });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle PC selection change
  const handlePCToggle = (pcId: string) => {
    setFormData({
      ...formData,
      pc_ids: formData.pc_ids.includes(pcId)
        ? formData.pc_ids.filter((id: string) => id !== pcId)
        : [...formData.pc_ids, pcId],
    });
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Имя сессии обязательно';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit({
        name: formData.name,
        description: formData.description || null,
        date: formData.date || undefined,
        notes: formData.notes || null,
        pc_ids: formData.pc_ids || [],
        npc_ids: formData.npc_ids || [],
        twist_ids: formData.twist_ids || [],
      });
    } catch (error) {
      console.error('Failed to submit session:', error);
      alert('Ошибка при сохранении сессии. Попробуйте снова.');
    }
  };

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div className="form-modal-backdrop" />
      <div className="form-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="form-modal-header">
          <h2 className="form-modal-title">
            {session ? '✏️ Редактировать сессию' : '🎲 Новая сессия'}
          </h2>
          <button
            onClick={onClose}
            className="form-modal-close-btn"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="form-modal-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME */}
            <div className="form-modal-field">
              <label className="form-modal-label">
                Имя сессии *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Например: Сессия 1 - Начало"
                className="form-modal-input"
              />
              {errors.name && (
                <p className="form-modal-error">{errors.name}</p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="form-modal-field">
              <label className="form-modal-label">
                Описание
              </label>
              <input
                type="text"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Краткое резюме того, что произошло"
                className="form-modal-input"
              />
            </div>

            {/* DATE */}
            <div className="form-modal-field">
              <label className="form-modal-label">
                Дата сессии
              </label>
              <input
                type="date"
                name="date"
                value={formData.date ? formData.date.split('T')[0] : ''}
                onChange={handleChange}
                className="form-modal-input"
              />
            </div>

            {/* PLAYER CHARACTERS SELECTION */}
            {availablePCs.length > 0 && (
              <div className="form-modal-field">
                <label className="form-modal-label">
                  Персонажи участники
                </label>
                <div style={{ background: 'rgba(255, 255, 255, 0.05)' }} className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-lg border border-slate-600">
                  {availablePCs.map((pc) => (
                    <label key={pc.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 p-2 rounded-lg transition">
                      <input
                        type="checkbox"
                        checked={Array.isArray(formData.pc_ids) && formData.pc_ids.includes(pc.id)}
                        onChange={() => handlePCToggle(pc.id)}
                        className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                      />
                      <span className="text-sm text-slate-100">{pc.name}</span>
                      {pc.player_name && (
                        <span className="text-xs text-slate-400">({pc.player_name})</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* NOTES / LOG */}
            <div className="form-modal-field">
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    !showPreview
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  ✏️ Редактировать
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    showPreview
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  👁️ Предпросмотр
                </button>
              </div>

              {!showPreview ? (
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  placeholder="Лог сессии и заметки... поддерживает Markdown"
                  rows={6}
                  className="form-modal-textarea"
                />
              ) : (
                <div className="form-modal-input overflow-y-auto max-h-48">
                  <div className="prose prose-invert max-w-none text-sm">
                    <ReactMarkdown>{formData.notes || ''}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="form-modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="form-modal-btn form-modal-btn-secondary"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="form-modal-btn form-modal-btn-primary"
              >
                {session ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
