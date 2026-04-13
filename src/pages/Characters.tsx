import { useState } from 'react';
import { useStore } from '../store';
import { CharacterForm } from '../components/CharacterForm';
import { CharacterCard } from '../components/CharacterCard';
import { PC, NPC } from '../types';

export default function Characters() {
  // Текущий активный таб: 'pc' (ПЛ) или 'npc' (НПЛ)
  const [activeTab, setActiveTab] = useState<'pc' | 'npc'>('pc');
  
  // Модальное окно: показано или скрыто
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Редактируемый персонаж (undefined при создании нового)
  const [editingCharacter, setEditingCharacter] = useState<PC | NPC | undefined>(undefined);

  // Получаем данные из Zustand store
  const pcs = useStore((state) => state.pcs);
  const npcs = useStore((state) => state.npcs);
  const addPc = useStore((state) => state.addPc);
  const updatePc = useStore((state) => state.updatePc);
  const deletePc = useStore((state) => state.deletePc);
  const addNpc = useStore((state) => state.addNpc);
  const updateNpc = useStore((state) => state.updateNpc);
  const deleteNpc = useStore((state) => state.deleteNpc);

  // Обработчик открытия модального окна для создания нового персонажа
  const handleAddCharacter = () => {
    setEditingCharacter(undefined);
    setIsModalOpen(true);
  };

  // Обработчик открытия модального окна для редактирования персонажа
  const handleEditCharacter = (character: PC | NPC) => {
    setEditingCharacter(character);
    setIsModalOpen(true);
  };

  // Обработчик закрытия модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCharacter(undefined);
  };

  // Обработчик сохранения формы
  const handleSubmitForm = (data: any) => {
    if (activeTab === 'pc') {
      // Если редактируем существующего ПЛ
      if (editingCharacter && 'id' in editingCharacter) {
        updatePc(editingCharacter.id, data);
      } else {
        // Если создаём нового ПЛ
        addPc(data);
      }
    } else {
      // Если редактируем существующего НПЛ
      if (editingCharacter && 'id' in editingCharacter) {
        updateNpc(editingCharacter.id, data);
      } else {
        // Если создаём нового НПЛ
        addNpc(data);
      }
    }
    handleCloseModal();
  };

  // Обработчик удаления персонажа
  const handleDeleteCharacter = (character: PC | NPC) => {
    // Простое подтверждение перед удалением
    if (confirm(`Удалить ${character.name}?`)) {
      if (activeTab === 'pc') {
        if ('id' in character) deletePc(character.id);
      } else {
        if ('id' in character) deleteNpc(character.id);
      }
    }
  };

  // Получаем список персонажей для активного таба
  const characters = activeTab === 'pc' ? pcs : npcs;
  const characterType = activeTab === 'pc' ? 'pc' : 'npc';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">🧙 Персонажи</h1>

      {/* Таб-навигация */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('pc')}
          className={`px-6 py-2 font-medium text-lg transition-colors border-b-2 ${
            activeTab === 'pc'
              ? 'text-blue-400 border-blue-400'
              : 'text-slate-400 border-transparent hover:text-slate-300'
          }`}
        >
          👥 Игроки (PC)
        </button>
        <button
          onClick={() => setActiveTab('npc')}
          className={`px-6 py-2 font-medium text-lg transition-colors border-b-2 ${
            activeTab === 'npc'
              ? 'text-blue-400 border-blue-400'
              : 'text-slate-400 border-transparent hover:text-slate-300'
          }`}
        >
          🤖 NPC
        </button>
      </div>

      {/* Кнопка "Добавить персонажа" */}
      <div>
        <button
          onClick={handleAddCharacter}
          className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors shadow-lg"
        >
          + Добавить {activeTab === 'pc' ? 'ПЛ' : 'НПЛ'}
        </button>
      </div>

      {/* Список персонажей в виде карточек */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {characters.length > 0 ? (
          characters.map((character, index) => (
            <div
              key={character.id}
              style={{
                // Плавная анимация появления с задержкой для каждой карточки
                animation: `slideInUp 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <CharacterCard
                character={character}
                type={characterType}
                onEdit={handleEditCharacter}
                onDelete={handleDeleteCharacter}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-400 text-lg">
              Нет {activeTab === 'pc' ? 'игроков' : 'неиграемых персонажей'}. Добавьте первого!
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно с формой */}
      {isModalOpen && (
        <CharacterForm
          type={activeTab}
          character={editingCharacter}
          onSubmit={handleSubmitForm}
          onClose={handleCloseModal}
        />
      )}

      {/* Стили для анимаций */}
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
