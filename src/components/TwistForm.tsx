import { useState } from 'react';
import { Twist } from '../types';

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
  const [formData, setFormData] = useState<any>(
    twist
      ? { ...twist }
      : {
          title: '',
          description: '',
          trigger_condition: '',
          type: 'revelation',
          consequence: '',
          status: 'hidden',
        }
  );

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
    <>
      {/* Semi-transparent background */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        {/* Modal window */}
        <div
          className="bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-4 text-white">
            {twist ? 'Редактировать твист' : 'Новый твист'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* TITLE */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Имя твиста *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                placeholder="Например: Появление врага"
                className={`w-full px-3 py-2 bg-slate-800 text-white rounded border ${
                  errors.title ? 'border-red-500' : 'border-slate-700'
                } focus:outline-none focus:border-blue-500 transition-colors`}
              />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* TYPE */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Тип твиста
              </label>
              <select
                name="type"
                value={formData.type || 'revelation'}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
              >
                {Object.entries(twistTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Детали твиста"
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* TRIGGER_CONDITION */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Триггер (условие)
              </label>
              <input
                type="text"
                name="trigger_condition"
                value={formData.trigger_condition || ''}
                onChange={handleChange}
                placeholder="Когда произойдёт этот твист?"
                className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* CONSEQUENCE */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Последствие
              </label>
              <textarea
                name="consequence"
                value={formData.consequence || ''}
                onChange={handleChange}
                placeholder="Что произойдёт в результате?"
                rows={2}
                className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Статус
              </label>
              <select
                name="status"
                value={formData.status || 'hidden'}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="hidden">Скрыт</option>
                <option value="ready">Готов</option>
                <option value="revealed">Раскрыт</option>
                <option value="completed">Завершён</option>
              </select>
            </div>

            {/* Submit and Close buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors"
              >
                {twist ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
