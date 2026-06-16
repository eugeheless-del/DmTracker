import { useState } from 'react';
import { Twist, TwistCondition, ConditionType, TwistInput } from '../types';

interface TwistFormProps {
  // Редактируемый твист (undefined при создании нового)
  twist?: Twist;
  // Коллбэк при сохранении формы
  onSubmit: (data: any) => Promise<void>;
  // Коллбэк при закрытии модального окна
  onClose: () => void;
}

// Map twist types to Russian labels
const twistTypeLabels: Record<string, string> = {
  revelation: 'Откровение',
  enemy: 'Враг',
  opportunity: 'Возможность',
  obstacle: 'Препятствие',
  alliance: 'Союз',
};

export function TwistForm({ twist, onSubmit, onClose }: TwistFormProps) {
  // Initialize form data
  const [formData, setFormData] = useState<TwistInput>(
    twist
      ? {
          ...twist,
          conditions: twist.conditions || [],
          isReady: twist.isReady ?? false,
        }
      : {
          title: '',
          description: '',
          trigger_condition: '',
          type: 'revelation',
          consequence: '',
          status: 'hidden',
          conditions: [],
          isReady: false,
        }
  );

  const [newConditionType, setNewConditionType] = useState<ConditionType>('LOCATION');
  const [newConditionLabel, setNewConditionLabel] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleConditionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewConditionType(e.target.value as ConditionType);
  };

  const handleConditionLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewConditionLabel(e.target.value);
  };

  const addCondition = () => {
    if (!newConditionLabel.trim()) return;

    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...(prev.conditions || []),
        {
          id: crypto.randomUUID(),
          type: newConditionType,
          label: newConditionLabel.trim(),
          isMet: false,
        },
      ],
    }));
    setNewConditionLabel('');
  };

  const toggleCondition = (conditionId: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: (prev.conditions || []).map((condition) =>
        condition.id === conditionId
          ? { ...condition, isMet: !condition.isMet }
          : condition
      ),
    }));
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Имя твиста обязательно';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit(formData);
    } catch (error) {
      alert('Ошибка при сохранении твиста. Попробуйте снова.');
      console.warn('Failed to submit twist:', error);
    }
  };

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div className="form-modal-backdrop" />
      <div className="form-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="form-modal-header">
          <h2 className="form-modal-title">
            {twist ? '✏️ Редактировать твист' : '✨ Новый твист'}
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
            {/* TITLE */}
            <div className="form-modal-field">
              <label className="form-modal-label">
                Имя твиста *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                placeholder="Например: Появление врага"
                className="form-modal-input"
              />
              {errors.title && (
                <p className="form-modal-error">{errors.title}</p>
              )}
            </div>

            {/* TYPE */}
            <div className="form-modal-field">
              <label className="form-modal-label">
                Тип твиста
              </label>
              <select
                name="type"
                value={formData.type || 'revelation'}
                onChange={handleChange}
                className="form-modal-select"
              >
                {Object.entries(twistTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* DESCRIPTION */}
            <div className="form-modal-field">
              <label className="form-modal-label">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Детали твиста"
                rows={3}
                className="form-modal-textarea"
              />
            </div>

            {/* TRIGGER_CONDITION */}
            <div className="form-modal-field">
              <label className="form-modal-label">
                Триггер (условие)
              </label>
              <input
                type="text"
                name="trigger_condition"
                value={formData.trigger_condition || ''}
                onChange={handleChange}
                placeholder="Когда произойдёт этот твист?"
                className="form-modal-input"
              />
            </div>

            {/* CONDITIONS */}
            <div className="form-modal-field">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <label className="form-modal-label">Условия активации</label>
                  <p className="text-xs text-slate-400">Добавьте условия, которые нужно отметить во время игры.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="form-modal-label text-xs">Тип условия</label>
                  <select
                    value={newConditionType}
                    onChange={handleConditionTypeChange}
                    className="form-modal-select"
                  >
                    <option value="LOCATION">Локация</option>
                    <option value="NPC">НПС</option>
                    <option value="ITEM">Предмет</option>
                    <option value="CUSTOM">Текст</option>
                  </select>
                </div>
                <div>
                  <label className="form-modal-label text-xs">Описание</label>
                  <input
                    type="text"
                    value={newConditionLabel}
                    onChange={handleConditionLabelChange}
                    placeholder="Например: Найти ключ"
                    className="form-modal-input"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addCondition}
                className="mt-3 form-modal-btn form-modal-btn-secondary"
              >
                Добавить условие
              </button>

              {formData.conditions && formData.conditions.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.conditions.map((condition: TwistCondition) => (
                    <label
                      key={condition.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 p-3"
                    >
                      <input
                        type="checkbox"
                        checked={condition.isMet}
                        onChange={() => toggleCondition(condition.id)}
                        className="h-4 w-4 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500"
                      />
                      <div className="flex-1 text-sm text-slate-200">
                        <div className="font-medium">{condition.label}</div>
                        <div className="text-xs text-slate-400">{condition.type}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* CONSEQUENCE */}
            <div className="form-modal-field">
              <label className="form-modal-label">
                Последствие
              </label>
              <textarea
                name="consequence"
                value={formData.consequence || ''}
                onChange={handleChange}
                placeholder="Что произойдёт в результате?"
                rows={2}
                className="form-modal-textarea"
              />
            </div>

            {/* STATUS */}
            <div className="form-modal-field">
              <label className="form-modal-label">
                Статус
              </label>
              <select
                name="status"
                value={formData.status || 'hidden'}
                onChange={handleChange}
                className="form-modal-select"
              >
                <option value="hidden">🙈 Скрыт</option>
                <option value="ready">⚡ Готов</option>
                <option value="revealed">👁️ Раскрыт</option>
                <option value="completed">✅ Завершён</option>
              </select>
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
                {twist ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
