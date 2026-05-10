import { useState } from 'react';
import { useStore } from '../store';
import { PC, NPC, NPCInput } from '../types';
import { CharacterForm } from '../components/CharacterForm';
import { CharacterCard } from '../components/CharacterCard';
import DrunkInnkeeperModal from '../components/DrunkInnkeeperModal';
import InventoryModal from '../components/InventoryModal';

function Characters() {
  const { pcs, npcs, addPc, updatePc, deletePc, addNpc, updateNpc, deleteNpc } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'pc' | 'npc'>('pc');
  const [editingCharacter, setEditingCharacter] = useState<PC | NPC | undefined>();
  const [drunkInnkeeperOpen, setDrunkInnkeeperOpen] = useState(false);
  const [inventoryPc, setInventoryPc] = useState<PC | undefined>();

  // Handle new character
  const handleNewCharacter = (type: 'pc' | 'npc') => {
    setFormType(type);
    setEditingCharacter(undefined);
    setShowForm(true);
  };

  // Handle character submit
  const handleCharacterSubmit = async (data: any) => {
    try {
      if (editingCharacter) {
        if (formType === 'pc') {
          await updatePc(editingCharacter.id, data);
        } else {
          await updateNpc(editingCharacter.id, data);
        }
      } else {
        if (formType === 'pc') {
          await addPc(data);
        } else {
          await addNpc(data);
        }
      }
      setShowForm(false);
      setEditingCharacter(undefined);
    } catch (error) {
      alert('Ошибка при сохранении персонажа. Попробуйте снова.');
      console.warn('Failed to submit character:', error);
    }
  };

  // Handle character edit
  const handleEditCharacter = (character: PC | NPC, type: 'pc' | 'npc') => {
    setFormType(type);
    setEditingCharacter(character);
    setShowForm(true);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-3xl font-bold">🧙 Персонажи</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleNewCharacter('pc')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-sm"
          >
            Игрок
          </button>
          <button
            onClick={() => handleNewCharacter('npc')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors text-sm"
          >
            НПС
          </button>
          <button
            onClick={() => setDrunkInnkeeperOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
          >
            <span>🍺</span>
            Пьяный Трактирщик
          </button>
        </div>
      </div>

      {/* Show form modal */}
      {showForm && (
        <CharacterForm
          type={formType}
          character={editingCharacter}
          onSubmit={handleCharacterSubmit}
          onClose={() => {
            setShowForm(false);
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
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center text-slate-400">
          <p className="text-lg mb-2">Пока нет персонажей</p>
          <p className="text-sm">Нажмите кнопку выше, чтобы добавить первого</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Player Characters (ПЛ) */}
          {pcs.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-400">ПЛ (Персонажи Игроков)</h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
            <div>
              <h3 className="text-xl font-bold mb-4 text-purple-400">НПЛ (Персонажи без Игроков)</h3>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
