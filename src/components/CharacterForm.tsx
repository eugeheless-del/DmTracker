import { useState } from 'react';
import { PC, NPC } from '../types';

interface CharacterFormProps {
  // Тип: 'pc' или 'npc' для отображения правильных полей
  type: 'pc' | 'npc';
  // Редактируемый персонаж (undefined при создании нового)
  character?: PC | NPC;
  // Коллбэк при сохранении формы
  onSubmit: (data: any) => void;
  // Коллбэк при закрытии модального окна
  onClose: () => void;
}

export function CharacterForm({ type, character, onSubmit, onClose }: CharacterFormProps) {
  // Инициализация формы: заполняем существующие данные или пусто
  const [formData, setFormData] = useState<any>(
    character ? { ...character } : {}
  );
  
  // Ошибки валидации (только имя обязательно)
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Обработчик изменения полей
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Валидация: имя обязательно
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Имя обязательно';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <>
      {/* Полупрозрачный фон */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Модальное окно, останавливаем распространение клика */}
        <div
          className="bg-slate-900 rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-4 text-white">
            {character ? 'Редактировать персонажа' : 'Новый персонаж'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME - всегда для обоих типов */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Имя *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Введите имя"
                className={`w-full px-3 py-2 bg-slate-800 text-white rounded border ${
                  errors.name ? 'border-red-500' : 'border-slate-700'
                } focus:outline-none focus:border-blue-500 transition-colors`}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* PC-специфичные поля */}
            {type === 'pc' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Имя игрока
                  </label>
                  <input
                    type="text"
                    name="playerName"
                    value={formData.playerName || ''}
                    onChange={handleChange}
                    placeholder="Имя игрока"
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Класс
                    </label>
                    <input
                      type="text"
                      name="class"
                      value={formData.class || ''}
                      onChange={handleChange}
                      placeholder="Воин"
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Раса
                    </label>
                    <input
                      type="text"
                      name="race"
                      value={formData.race || ''}
                      onChange={handleChange}
                      placeholder="Человек"
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Уровень
                    </label>
                    <input
                      type="number"
                      name="level"
                      value={formData.level || ''}
                      onChange={handleChange}
                      placeholder="1"
                      min="1"
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Мировоззрение
                    </label>
                    <select
                      name="alignment"
                      value={formData.alignment || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="">Выберите</option>
                      <option value="lawful_good">Справедливо-добрый</option>
                      <option value="neutral_good">Нейтрально-добрый</option>
                      <option value="chaotic_good">Хаотично-добрый</option>
                      <option value="lawful_neutral">Справедливо-нейтральный</option>
                      <option value="true_neutral">Истинно нейтральный</option>
                      <option value="chaotic_neutral">Хаотично-нейтральный</option>
                      <option value="lawful_evil">Справедливо-злой</option>
                      <option value="neutral_evil">Нейтрально-злой</option>
                      <option value="chaotic_evil">Хаотично-злой</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      HP (текущие)
                    </label>
                    <input
                      type="number"
                      name="hp"
                      value={formData.hp || ''}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Max HP
                    </label>
                    <input
                      type="number"
                      name="maxHp"
                      value={formData.maxHp || ''}
                      onChange={handleChange}
                      placeholder="10"
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Заметки
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    placeholder="Дополнительная информация"
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </>
            )}

            {/* NPC-специфичные поля */}
            {type === 'npc' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Роль/Профессия
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Кузнец, маг и т.д."
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Внешность
                  </label>
                  <textarea
                    name="appearance"
                    value={formData.appearance || ''}
                    onChange={handleChange}
                    placeholder="Описание внешнего вида"
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Местоположение
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ''}
                    onChange={handleChange}
                    placeholder="Деревня, город и т.д."
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Мироввоззрение
                  </label>
                  <select
                    name="alignment"
                    value={formData.alignment || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Выберите</option>
                    <option value="lawful_good">Справедливо-добрый</option>
                    <option value="neutral_good">Нейтрально-добрый</option>
                    <option value="chaotic_good">Хаотично-добрый</option>
                    <option value="lawful_neutral">Справедливо-нейтральный</option>
                    <option value="true_neutral">Истинно нейтральный</option>
                    <option value="chaotic_neutral">Хаотично-нейтральный</option>
                    <option value="lawful_evil">Справедливо-злой</option>
                    <option value="neutral_evil">Нейтрально-злой</option>
                    <option value="chaotic_evil">Хаотично-злой</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Заметки
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    placeholder="Дополнительная информация"
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </>
            )}

            {/* Кнопки действия */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors font-medium"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors font-medium"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Добавляем стиль для анимации появления */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
