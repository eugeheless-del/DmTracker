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
    <div className="character-card relative">
      <div className="character-card__content-wrapper">
        <div className="character-card__header">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="character-card__title">{character.name}</h3>
                <p className="character-card__subtitle">
                  {type === 'pc' ? `${pc?.race || 'Раса не указана'} • ${pc?.class || 'Класс не указан'} • Ур. ${pc?.level || '—'}` : npc?.role || 'Роль не указана'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {character.notes && (
          <div className="character-card__notes">
            <div className="character-card__notes-label">📝 Заметки</div>
            <p className="character-card__notes-text">{character.notes}</p>
          </div>
        )}

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

      {type === 'pc' && (
        <div className="status-badges-wrapper">
          <StatusBadges statuses={(character as PC).statuses} maxVisible={5} />
        </div>
      )}

      {statusPc && (
        <StatusModal pc={statusPc} onClose={() => setStatusPc(undefined)} />
      )}
    </div>
  );
}
