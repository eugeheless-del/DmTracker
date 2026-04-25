import { useState } from 'react';
import { PC, NPC } from '../types';
import { useStore } from '../store';
import StatusModal from './StatusModal';
import { StatusBadges } from './StatusBadges';

interface CharacterCardProps {
  // Персонаж для отображения (PC или NPC)
  character: PC | NPC;
  // Тип персонажа: 'pc' или 'npc'
  type: 'pc' | 'npc';
  // Коллбэк при клике для редактирования
  onEdit: (character: PC | NPC) => void;
  // Коллбэк при удалении
  onDelete: (character: PC | NPC) => void;
  // Коллбэк для открытия инвентаря (только для PC)
  onInventory?: (pc: PC) => void;
}

export function CharacterCard({ character, type, onEdit, onDelete, onInventory }: CharacterCardProps) {
  const { updatePc } = useStore();
  const [hpInput, setHpInput] = useState<string>('');
  const [isEditingHp, setIsEditingHp] = useState(false);
  const [statusPc, setStatusPc] = useState<PC | undefined>();

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
      return npc.role || 'Неизвестная роль';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-4 hover:shadow-xl hover:bg-slate-750 transition-all duration-300 border border-slate-700 hover:border-slate-600">
      {/* Заголовок: имя и дополнительная информация */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-white">{character.name}</h3>
            {/* Status badges for PC */}
            {type === 'pc' && <StatusBadges statuses={(character as PC).statuses} maxVisible={5} />}
          </div>
          <p className="text-sm text-slate-400 mt-1">{getRoleText()}</p>
        </div>
      </div>

      {/* Дополнительная информация в зависимости от типа */}
      <div className="text-sm text-slate-300 mb-4 space-y-1">
        {type === 'pc' && (
          <>
            {(character as PC).player_name && (
              <p>👤 Игрок: <span className="text-slate-100">{(character as PC).player_name}</span></p>
            )}
            {(character as PC).ac !== undefined && (
              <p>🛡️ AC: <span className="text-slate-100">{(character as PC).ac}</span></p>
            )}
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
              </span></p>
            </div>
          </>
        )}
        {type === 'npc' && (
          <>
            {(character as NPC).location && (
              <p>📍 Локация: <span className="text-slate-100">{(character as NPC).location}</span></p>
            )}
            {(character as NPC).status && (
              <p>⚡ Статус: <span className={
                (character as NPC).status === 'alive' ? 'text-green-400' :
                (character as NPC).status === 'dead' ? 'text-red-400' :
                'text-yellow-400'
              }>
                {(character as NPC).status === 'alive' ? 'Жив' :
                 (character as NPC).status === 'dead' ? 'Мертв' :
                 'Пропал'}
              </span></p>
            )}
          </>
        )}
      </div>

      {/* Кнопки действия */}
      <div className="flex gap-2 flex-wrap">
        {type === 'pc' && (
          <>
            <button
              onClick={() => onInventory?.(character as PC)}
              className="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded transition-colors min-w-fit"
            >
              🎒 Инвентарь
            </button>
            <button
              onClick={() => setStatusPc(character as PC)}
              className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded transition-colors min-w-fit"
            >
              ✨ Статусы
            </button>
          </>
        )}
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
      
      {/* Status Modal */}
      {statusPc && (
        <StatusModal pc={statusPc} onClose={() => setStatusPc(undefined)} />
      )}
    </div>
  );
}
