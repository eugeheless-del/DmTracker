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

  const pc = type === 'pc' ? (character as PC) : undefined;
  const npc = type === 'npc' ? (character as NPC) : undefined;

  return (
    <div className="character-card">
      <div className="character-card__content">
        <div className="character-card__header">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="character-card__title">{character.name}</h3>
                <p className="character-card__subtitle">
                  {type === 'pc' ? `${pc?.race || 'Раса не указана'} • ${pc?.class || 'Класс не указан'} • Ур. ${pc?.level || '—'}` : npc?.role || 'Роль не указана'}
                </p>
              </div>
              {type === 'pc' && <StatusBadges statuses={(character as PC).statuses} maxVisible={5} />}
            </div>
          </div>
        </div>

        <div className="character-card__meta">
          {type === 'pc' && (
            <>
              {pc?.player_name && (
                <div className="character-card__detail">👤 Игрок: <span>{pc.player_name}</span></div>
              )}
              <div className="character-card__detail">❤️ HP: <span>
                {isEditingHp ? (
                  <input
                    type="number"
                    value={hpInput}
                    onChange={handleHpChange}
                    onBlur={handleHpSave}
                    onKeyDown={handleHpKeyDown}
                    autoFocus
                    min="0"
                    className="character-card__hp-input"
                  />
                ) : (
                  <span
                    onClick={() => {
                      setIsEditingHp(true);
                      setHpInput(String(pc?.hp || 0));
                    }}
                    className="character-card__hp-value"
                  >
                    {pc?.hp || 0}
                  </span>
                )}
              </span></div>
              {typeof pc?.ac === 'number' && (
                <div className="character-card__detail">🛡️ AC: <span>{pc.ac}</span></div>
              )}
            </>
          )}

          {type === 'npc' && (
            <>
              {npc?.location && (
                <div className="character-card__detail">📍 Локация: <span>{npc.location}</span></div>
              )}
              {npc?.status && (
                <div className="character-card__detail">⚡ Статус: <span className={
                  npc.status === 'alive' ? 'text-emerald-300' :
                  npc.status === 'dead' ? 'text-rose-300' :
                  'text-amber-300'
                }>
                  {npc.status === 'alive' ? 'Жив' : npc.status === 'dead' ? 'Мертв' : 'Пропал'}
                </span></div>
              )}
            </>
          )}
        </div>

        <div className="character-card__actions">
          {type === 'pc' && (
            <>
              <button
                type="button"
                onClick={() => onInventory?.(character as PC)}
                className="character-card__action-btn character-card__action-btn--inventory"
                aria-label="Инвентарь"
                title="Инвентарь"
              >
                🎒
              </button>
              <button
                type="button"
                onClick={() => setStatusPc(character as PC)}
                className="character-card__action-btn character-card__action-btn--status"
                aria-label="Статусы"
                title="Статусы"
              >
                ✨
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => onEdit(character)}
            className="character-card__action-btn character-card__action-btn--edit"
            aria-label="Редактировать"
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={() => onDelete(character)}
            className="character-card__action-btn character-card__action-btn--delete"
            aria-label="Удалить"
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      </div>

      {statusPc && (
        <StatusModal pc={statusPc} onClose={() => setStatusPc(undefined)} />
      )}
    </div>
  );
}
