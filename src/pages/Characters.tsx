import { useState } from 'react';
import { useStore } from '../store';
import { PC, NPC, NPCInput } from '../types';
import { CharacterForm } from '../components/CharacterForm';
import { CharacterCard } from '../components/CharacterCard';
import DrunkInnkeeperModal from '../components/DrunkInnkeeperModal';
import InventoryModal from '../components/InventoryModal';

function Characters() {
  const {
    pcs,
    npcs,
    addPc,
    updatePc,
    deletePc,
    addNpc,
    updateNpc,
    deleteNpc,
    showCharacterForm,
    characterFormType,
    openCharacterForm,
    closeCharacterForm,
  } = useStore();
  const [editingCharacter, setEditingCharacter] = useState<PC | NPC | undefined>();
  const [drunkInnkeeperOpen, setDrunkInnkeeperOpen] = useState(false);
  const [inventoryPc, setInventoryPc] = useState<PC | undefined>();

  // Handle new character
  const handleNewCharacter = (type: 'pc' | 'npc') => {
    setEditingCharacter(undefined);
    openCharacterForm(type);
  };

  // Handle character submit
  const handleCharacterSubmit = async (data: any): Promise<any> => {
    try {
      if (editingCharacter) {
        if (characterFormType === 'pc') {
          await updatePc(editingCharacter.id, data);
        } else {
          await updateNpc(editingCharacter.id, data);
        }
        closeCharacterForm();
        setEditingCharacter(undefined);
        return undefined;
      }

      if (characterFormType === 'pc') {
        await addPc(data);
        closeCharacterForm();
        return undefined;
      }

      const createdNpc = await addNpc(data);
      closeCharacterForm();
      setEditingCharacter(undefined);
      return createdNpc;
    } catch (error) {
      alert('Ошибка при сохранении персонажа. Попробуйте снова.');
      console.warn('Failed to submit character:', error);
      return undefined;
    }
  };

  // Handle character edit
  const handleEditCharacter = (character: PC | NPC, type: 'pc' | 'npc') => {
    setEditingCharacter(character);
    openCharacterForm(type);
  };

  // Handle character delete
  const handleDeleteCharacter = async (character: PC | NPC, type: 'pc' | 'npc') => {
    if (window.confirm(`Удалить персонажа "${character.name}"?`)) {
      try {
        if (type === 'pc') {
          await deletePc(character.id);
        } else {
          await deleteNpc(character.id);
        }
      } catch (error) {
        alert('Ошибка при удалении персонажа. Попробуйте снова.');
        console.warn('Failed to delete character:', error);
      }
    }
  };

  // Handle save from Drunk Innkeeper generator
  const handleSaveFromDrunk = async (npcInput: NPCInput) => {
    try {
      await addNpc(npcInput);
    } catch (error) {
      console.warn('Failed to add NPC from generator:', error);
      throw error;
    }
  };

  // Handle inventory open
  const handleInventoryOpen = (pc: PC) => {
    setInventoryPc(pc);
  };

  // Handle inventory close
  const handleInventoryClose = () => {
    setInventoryPc(undefined);
  };

  const allEmpty = pcs.length === 0 && npcs.length === 0;

  return (
    <div className="section space-y-6">
      <div className="flex-between gap-sm flex-wrap">
        <h2 className="h2">🧙 Персонажи</h2>
        <div className="flex gap-sm">
          <button
            onClick={() => handleNewCharacter('pc')}
            className="btn btn--primary"
          >
            Игрок
          </button>
          <button
            onClick={() => handleNewCharacter('npc')}
            className="btn btn--secondary"
          >
            НПС
          </button>
          <button
            onClick={() => setDrunkInnkeeperOpen(true)}
            className="btn btn--accent"
          >
            <span>🍺</span>
            Пьяный Трактирщик
          </button>
        </div>
      </div>

      {/* Show form modal */}
      {showCharacterForm && (
        <CharacterForm
          type={characterFormType}
          character={editingCharacter}
          onSubmit={handleCharacterSubmit}
          onClose={() => {
            closeCharacterForm();
            setEditingCharacter(undefined);
          }}
        />
      )}

      {/* Drunk Innkeeper modal */}
      <DrunkInnkeeperModal
        isOpen={drunkInnkeeperOpen}
        onClose={() => setDrunkInnkeeperOpen(false)}
        onSave={handleSaveFromDrunk}
        showFloatingButton={false}
      />

      {/* Empty state */}
      {allEmpty ? (
        <div className="card card--bordered text-center">
          <p className="h3 mb-2 text-muted">Пока нет персонажей</p>
          <p className="small text-muted">Нажмите кнопку выше, чтобы добавить первого</p>
        </div>
      ) : (
        <div className="space-y-8 w-full">
          {/* Player Characters (ПЛ) */}
          {pcs.length > 0 && (
            <div className="w-full">
              <h3 className="h3 text-primary mb-4">Игроки</h3>
              <div className="char-grid-wrapper w-full" style={{ marginBottom: '32px' }}>
                {pcs.map((pc) => (
                  <CharacterCard
                    key={pc.id}
                    character={pc}
                    type="pc"
                    onEdit={() => handleEditCharacter(pc, 'pc')}
                    onDelete={() => handleDeleteCharacter(pc, 'pc')}
                    onInventory={handleInventoryOpen}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Non-Player Characters (НПЛ) */}
          {npcs.length > 0 && (
            <div className="w-full">
              <h3 className="h3 text-purple mb-4">NPC</h3>
              <div className="char-grid-wrapper w-full flex-1 min-w-0" style={{ marginBottom: '32px' }}>
                {npcs.map((npc) => (
                  <CharacterCard
                    key={npc.id}
                    character={npc}
                    type="npc"
                    onEdit={() => handleEditCharacter(npc, 'npc')}
                    onDelete={() => handleDeleteCharacter(npc, 'npc')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory Modal */}
      {inventoryPc && (
        <InventoryModal
          pc={inventoryPc}
          onClose={handleInventoryClose}
        />
      )}
    </div>
  );
}

export default Characters;
