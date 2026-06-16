import { useState } from 'react';
import { useStore } from '../store';
import type { NPCConnectionType, NPCTwistConnection, PC, NPC } from '../types';

interface CharacterFormProps {
  // Тип: 'pc' или 'npc' для отображения правильных полей
  type: 'pc' | 'npc';
  // Редактируемый персонаж (undefined при создании нового)
  character?: PC | NPC;
  // Коллбэк при сохранении формы
  onSubmit: (data: any) => Promise<{ id?: string } | void>;
  // Коллбэк при закрытии модального окна
  onClose: () => void;
}

type TempConnection = {
  twistId: string;
  type: NPCConnectionType;
};

export function CharacterForm({ type, character, onSubmit, onClose }: CharacterFormProps) {
  // Инициализация формы: заполняем существующие данные или пусто
  const [formData, setFormData] = useState<any>(
    character ? { ...character } : {}
  );
  
  // Ошибки валидации (только имя обязательно)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { twists, addNPCTwistConnection, removeNPCTwistConnection } = useStore();
  const [connections, setConnections] = useState<NPCTwistConnection[]>(
    (character as NPC)?.twist_connections ?? []
  );
  const [tempConnections, setTempConnections] = useState<TempConnection[]>([]);
  const [newConnectionTwistId, setNewConnectionTwistId] = useState('');
  const [newConnectionType, setNewConnectionType] = useState<NPCConnectionType>('involved');

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

  const handleAddConnection = async () => {
    if (type !== 'npc' || !newConnectionTwistId) return;

    if (character?.id) {
      try {
        const newConnection = await addNPCTwistConnection(
          character.id,
          newConnectionTwistId,
          newConnectionType
        );
        setConnections((prev) => [...prev, newConnection]);
      } catch (error) {
        alert('Не удалось добавить связь с твистом. Попробуйте снова.');
        console.warn('Failed to add twist connection:', error);
        return;
      }
    } else {
      setTempConnections((prev) => [
        ...prev,
        { twistId: newConnectionTwistId, type: newConnectionType },
      ]);
    }

    setNewConnectionTwistId('');
    setNewConnectionType('involved');
  };

  const handleRemoveConnection = async (connectionId: string) => {
    try {
      await removeNPCTwistConnection(connectionId);
      setConnections((prev) => prev.filter((connection) => connection.id !== connectionId));
    } catch (error) {
      alert('Не удалось удалить связь. Попробуйте снова.');
      console.warn('Failed to remove twist connection:', error);
    }
  };

  const handleRemoveTempConnection = (twistId: string, type: NPCConnectionType) => {
    setTempConnections((prev) =>
      prev.filter((connection) => !(connection.twistId === twistId && connection.type === type))
    );
  };

  // // Обработчик отправки формы
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!validate()) return;
  //   try {
  //     await onSubmit(formData);
  //   } catch (error) {
  //     alert('Ошибка при сохранении персонажа. Попробуйте снова.');
  //     console.warn('Failed to submit character:', error);
  //   }
  // };
    // Обработчик отправки формы
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  
  try {
    // 🔥 ИСКЛЮЧАЕМ inventory и statuses из данных персонажа
    // Они сохраняются отдельно через другие таблицы
    const { inventory, statuses, ...characterData } = formData;

    // Сохраняем персонажа
    const result = await onSubmit(characterData);

    if (!character && result?.id && tempConnections.length > 0) {
      await Promise.all(
        tempConnections.map((conn) =>
          addNPCTwistConnection(result.id!, conn.twistId, conn.type)
        )
      );
      setTempConnections([]);
    }
  } catch (error) {
    alert('Ошибка при сохранении персонажа. Попробуйте снова.');
    console.warn('Failed to submit character:', error);
  }
};

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[1000]"
        onClick={onClose}
      >
        <div
          className="relative z-[1001] bg-[rgba(20,24,38,0.95)] border border-[rgba(86,128,233,0.35)] rounded-2xl shadow-2xl max-w-2xl w-full p-6 backdrop-blur-xl animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300 mb-2">{character ? 'Редактирование' : 'Новый персонаж'}</p>
              <h2 className="text-3xl font-semibold text-white">{character ? 'Персонаж' : 'Создать персонажа'}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-white text-2xl"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-2xl bg-slate-800/50 border border-slate-600/60 p-5 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-blue-300 mb-4">Основные данные</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Имя *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="Введите имя"
                    className={`w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-2">{errors.name}</p>}
                </div>

                {type === 'pc' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Класс</label>
                      <input
                        type="text"
                        name="class"
                        value={formData.class || ''}
                        onChange={handleChange}
                        placeholder="Воин"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Раса</label>
                      <input
                        type="text"
                        name="race"
                        value={formData.race || ''}
                        onChange={handleChange}
                        placeholder="Человек"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Уровень</label>
                      <input
                        type="number"
                        name="level"
                        value={formData.level || ''}
                        onChange={handleChange}
                        placeholder="1"
                        min="1"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </>
                )}
              </div>
            </section>

            {type === 'pc' && (
              <section className="rounded-2xl bg-slate-800/50 border border-slate-600/60 p-5 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-blue-300 mb-4">Характеристики</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">HP (текущие)</label>
                    <input
                      type="number"
                      name="hp"
                      value={formData.hp || ''}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Класс Доспеха (AC)</label>
                    <input
                      type="number"
                      name="ac"
                      value={formData.ac || ''}
                      onChange={handleChange}
                      placeholder="10"
                      min="0"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </section>
            )}

            {type === 'pc' && (
              <section className="rounded-2xl bg-slate-800/50 border border-slate-600/60 p-5 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-blue-300 mb-4">Дополнительно</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Имя игрока</label>
                    <input
                      type="text"
                      name="player_name"
                      value={formData.player_name || ''}
                      onChange={handleChange}
                      placeholder="Имя игрока"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Telegram Chat ID</label>
                    <input
                      type="text"
                      name="telegram_chat_id"
                      value={formData.telegram_chat_id || ''}
                      onChange={handleChange}
                      placeholder="Например: 123456789"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    />
                    <p className="text-xs text-slate-400 mt-2">💡 Получите ID у бота: напишите /start вашему Telegram боту</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Заметки</label>
                    <textarea
                      name="notes"
                      value={formData.notes || ''}
                      onChange={handleChange}
                      placeholder="Дополнительная информация"
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </section>
            )}

            {type === 'npc' && (
              <section className="rounded-2xl bg-slate-800/50 border border-slate-600/60 p-5 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-blue-300 mb-4">Дополнительно</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Роль/Профессия</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role || ''}
                      onChange={handleChange}
                      placeholder="Кузнец, маг и т.д."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Внешность</label>
                    <textarea
                      name="appearance"
                      value={formData.appearance || ''}
                      onChange={handleChange}
                      placeholder="Описание внешнего вида"
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Местоположение</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleChange}
                      placeholder="Деревня, город и т.д."
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Статус</label>
                    <select
                      name="status"
                      value={formData.status || ''}
                      onChange={handleChange}
                      className="form-dropdown w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="">Выберите</option>
                      <option value="alive">Жив</option>
                      <option value="dead">Мертв</option>
                      <option value="missing">Пропал</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Заметки</label>
                    <textarea
                      name="notes"
                      value={formData.notes || ''}
                      onChange={handleChange}
                      placeholder="Дополнительная информация"
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </section>
            )}

            {type === 'npc' && (
              <div className="form-section border-t border-slate-700 pt-4 mt-4">
                <h3 className="text-lg text-blue-300 mb-3">🔗 Связи с твистами</h3>

                <div className="space-y-2 mb-3">
                  {connections.map((connection) => {
                    const twistTitle =
                      twists.find((twist) => twist.id === connection.twist_id)?.title ||
                      connection.twist?.title ||
                      'Неизвестный твист';

                    return (
                      <div key={connection.id} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-300">Твист</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-blue-300">{twistTitle}</span>
                          <span className="text-xs text-slate-400">({connection.connection_type})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveConnection(connection.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}

                  {tempConnections.map((connection, index) => {
                    const twistTitle =
                      twists.find((twist) => twist.id === connection.twistId)?.title ||
                      'Неизвестный твист';

                    return (
                      <div key={`temp-${index}`} className="flex items-center justify-between bg-slate-800/80 p-2 rounded border border-dashed border-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-300">Новая связь</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-blue-300">{twistTitle}</span>
                          <span className="text-xs text-slate-400">({connection.type})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTempConnection(connection.twistId, connection.type)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <select
                    value={newConnectionTwistId}
                    onChange={(e) => setNewConnectionTwistId(e.target.value)}
                    className="form-dropdown flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                  >
                    <option value="">Выберите твист...</option>
                    {twists.map((twist) => (
                      <option key={twist.id} value={twist.id}>{twist.title}</option>
                    ))}
                  </select>

                  <select
                    value={newConnectionType}
                    onChange={(e) => setNewConnectionType(e.target.value as NPCConnectionType)}
                    className="form-dropdown bg-slate-800 border border-slate-600 rounded px-2 py-2 text-white text-sm"
                  >
                    <option value="involved">Участвует</option>
                    <option value="victim">Жертва</option>
                    <option value="culprit">Виновник</option>
                    <option value="witness">Свидетель</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddConnection}
                    disabled={!newConnectionTwistId}
                    className="btn btn--primary px-3"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 bg-slate-700/80 text-white rounded-2xl hover:bg-slate-600 transition font-medium"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/20 hover:from-blue-400 hover:to-blue-500 transition"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        select.form-dropdown option {
          background-color: #f8fafc;
          color: #0f172a;
        }

        select.form-dropdown option:hover,
        select.form-dropdown option:checked {
          background-color: #2563eb;
          color: #ffffff;
        }

        .animate-fade-in {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
