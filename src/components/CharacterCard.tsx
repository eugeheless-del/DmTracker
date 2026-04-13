import { useState } from 'react';
import { PC, NPC } from '../types';
import { useStore } from '../store';

interface CharacterCardProps {
  // Персонаж для отображения (PC или NPC)
  character: PC | NPC;
  // Тип персонажа: 'pc' или 'npc'
  type: 'pc' | 'npc';
  // Коллбэк при клике для редактирования
  onEdit: (character: PC | NPC) => void;
  // Коллбэк при удалении
  onDelete: (character: PC | NPC) => void;
}

export function CharacterCard({ character, type, onEdit, onDelete }: CharacterCardProps) {
  const { updatePc } = useStore();
  const [hpInput, setHpInput] = useState<string>('');
  const [isEditingHp, setIsEditingHp] = useState(false);

  // Handle HP edit
  const handleHpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHpInput(e.target.value);
  };

  // Save HP changes
  const handleHpSave = () => {
    const newHp = parseInt(hpInput, 10);
    if (!isNaN(newHp) && type === 'pc' && newHp >= 0) {
      updatePc((character as PC).id, { hp: newHp });
      setIsEditingHp(false);
      setHpInput('');
    }
  };

  // Handle Enter key in HP input
  const handleHpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleHpSave();
    } else if (e.key === 'Escape') {
      setIsEditingHp(false);
      setHpInput('');
    }
  };

  // Функция для получения цвета бейджа по выравниванию
  const getAlignmentBadgeColor = (alignment?: string): string => {
    switch (alignment) {
      case 'lawful_good':
      case 'neutral_good':
      case 'chaotic_good':
        return 'bg-green-500 text-white'; // Добрые персонажи - зелёный
      case 'lawful_neutral':
      case 'true_neutral':
      case 'chaotic_neutral':
        return 'bg-slate-500 text-white'; // Нейтральные - серый
      case 'lawful_evil':
      case 'neutral_evil':
      case 'chaotic_evil':
        return 'bg-red-500 text-white'; // Злые - красный
      default:
        return 'bg-slate-400 text-white'; // По умолчанию
    }
  };

  // Функция для сокращённого отображения выравнивания
  const getAlignmentLabel = (alignment?: string): string => {
    const labels: Record<string, string> = {
      lawful_good: 'Добрый (ПД)',
      neutral_good: 'Добрый (НД)',
      chaotic_good: 'Добрый (ХД)',
      lawful_neutral: 'Нейтральный (ПН)',
      true_neutral: 'Нейтральный (ИН)',
      chaotic_neutral: 'Нейтральный (ХН)',
      lawful_evil: 'Злой (ПЗ)',
      neutral_evil: 'Злой (НЗ)',
      chaotic_evil: 'Злой (ХЗ)',
    };
    return labels[alignment || ''] || 'Не выбрано';
  };

  // Для PC: отображаем класс и уровень
  const getRoleText = (): string => {
    if (type === 'pc') {
      const pc = character as PC;
      const classText = pc.class || 'Неизвестен';
      const levelText = pc.level ? ` (Ур. ${pc.level})` : '';
      return `${classText}${levelText}`;
    } else {
      // Для NPC: отображаем роль
      const npc = character as NPC;
      return npc.description || 'Неизвестная роль';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-4 hover:shadow-xl hover:bg-slate-750 transition-all duration-300 border border-slate-700 hover:border-slate-600">
      {/* Заголовок: имя и бейдж */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white truncate">{character.name}</h3>
          <p className="text-sm text-slate-400 mt-1">{getRoleText()}</p>
        </div>
        {/* Бейдж статуса (выравнивание) */}
        <span
          className={`ml-2 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getAlignmentBadgeColor(
            character.alignment
          )}`}
        >
          {getAlignmentLabel(character.alignment)}
        </span>
      </div>

      {/* Дополнительная информация в зависимости от типа */}
      <div className="text-sm text-slate-300 mb-4 space-y-1">
        {type === 'pc' && (
          <>
            {(character as PC).playerName && (
              <p>👤 Игрок: <span className="text-slate-100">{(character as PC).playerName}</span></p>
            )}
            {(character as PC).maxHp && (
              <div className="flex items-center gap-2">
                <p>❤️ HP: <span className="text-slate-100">
                  {isEditingHp ? (
                    <input
                      type="number"
                      value={hpInput}
                      onChange={handleHpChange}
                      onBlur={handleHpSave}
                      onKeyDown={handleHpKeyDown}
                      autoFocus
                      min="0"
                      className="w-12 px-1 py-0 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span onClick={() => {
                      setIsEditingHp(true);
                      setHpInput(String((character as PC).hp || 0));
                    }} className="cursor-pointer hover:text-blue-300">
                      {(character as PC).hp || 0}
                    </span>
                  )}
                </span>/<span>{(character as PC).maxHp}</span></p>
              </div>
            )}
          </>
        )}
        {type === 'npc' && (
          <>
            {(character as NPC).location && (
              <p>📍 Локация: <span className="text-slate-100">{(character as NPC).location}</span></p>
            )}
          </>
        )}
      </div>

      {/* Кнопки действия */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(character)}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
        >
          Редактировать
        </button>
        <button
          onClick={() => onDelete(character)}
          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded transition-colors"
        >
          Удалить
        </button>
      </div>
    </div>
  );
}
