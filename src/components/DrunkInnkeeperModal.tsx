import { useState } from 'react';
import { generateQuirkyNPC, formatNPCDescription } from '../utils/drunkInnkeeperGenerator';
import { QuirkyNPC, NPCInput } from '../types';
import { useStore } from '../store';

interface DrunkInnkeeperModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (npc: NPCInput) => Promise<void>;
  showFloatingButton?: boolean;
}

/**
 * DrunkInnkeeperModal Component
 * Generates quirky NPC characters with a fun modal interface
 * Can be used as standalone floating button or controlled via props
 */
export default function DrunkInnkeeperModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onSave: customOnSave,
  showFloatingButton = true,
}: DrunkInnkeeperModalProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const [currentNPC, setCurrentNPC] = useState<QuirkyNPC | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const addNpc = useStore((state) => state.addNpc);

  // Handle open/close state (controlled or uncontrolled)
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : uncontrolledIsOpen;
  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setUncontrolledIsOpen(false);
    }
  };
  const handleOpen = () => {
    handleGenerate();
    if (controlledIsOpen === undefined) {
      setUncontrolledIsOpen(true);
    }
  };

  // Generate new quirky NPC
  const handleGenerate = () => {
    const newNPC = generateQuirkyNPC();
    setCurrentNPC(newNPC);
  };

  // Convert QuirkyNPC to NPCInput format
  const convertToNPCInput = (quirkyNPC: QuirkyNPC): NPCInput => {
    return {
      name: quirkyNPC.name,
      role: 'Пьяный трактирщик',
      appearance: quirkyNPC.physicalQuirk,
      notes: formatNPCDescription(quirkyNPC),
      location: `Таверна (${quirkyNPC.mood})`,
      status: 'alive',
    };
  };

  // Save NPC to database
  const handleAddNPC = async () => {
    if (!currentNPC) return;
    
    setIsLoading(true);
    try {
      const npcInput = convertToNPCInput(currentNPC);

      if (customOnSave) {
        await customOnSave(npcInput);
      } else {
        await addNpc(npcInput);
      }

      // Show notification
      setNotification('✅ Постоялец добавлен!');
      setTimeout(() => {
        handleClose();
        setCurrentNPC(null);
        setNotification('');
      }, 1000);
    } catch (error) {
      console.warn('Failed to save NPC:', error);
      setNotification('❌ Ошибка при сохранении');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Icon mapping for characteristics
  const categoryIcons = {
    background: '📜',
    physicalQuirk: '👁️',
    smell: '👃',
    speechPattern: '🗣️',
    secretTrade: '🤫',
    lyingAbout: '🤥',
  };

  return (
    <>
      {/* Floating button (only if showFloatingButton is true) */}
      {showFloatingButton && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-40 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2 text-base hover:shadow-2xl hover:scale-105"
          title="Генератор NPC 'Пьяный Трактирщик'"
        >
          <span className="text-xl">🍺</span>
          <span className="hidden sm:inline">Трактирщик</span>
        </button>
      )}

      {/* Modal backdrop and container */}
      {isOpen && (
        <div
          className="drunk-innkeeper-modal-overlay"
          onClick={handleClose}
        >
          <div className="drunk-innkeeper-modal-backdrop" />

          {/* Modal window */}
          <div
            className="drunk-innkeeper-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Notification */}
            {notification && (
              <div className="px-5 py-3 bg-amber-900/30 border border-amber-500 rounded-lg text-center text-amber-200 font-semibold mb-4">
                {notification}
              </div>
            )}

            {/* Header */}
            <div className="drunk-innkeeper-modal-header">
              <h2 className="drunk-innkeeper-modal-title">
                <span className="text-3xl">🍺</span>
                <span>Пьяный Трактирщик</span>
              </h2>
              <button
                onClick={handleClose}
                className="form-modal-close-btn"
                type="button"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="drunk-innkeeper-modal-body">
              {/* NPC Result Card */}
              {currentNPC ? (
                <>
                  <div className="npc-result-card">
                    {/* Name */}
                    <div className="npc-result-name">
                      <p className="npc-result-name-label">Имя постояльца</p>
                      <h3 className="npc-result-name-value">{currentNPC.name}</h3>
                    </div>

                    {/* Mood badge */}
                    <div className="flex justify-center">
                      <span className="npc-result-mood-badge">
                        {currentNPC.mood === 'drunk' && '🥴 Пьян'}
                        {currentNPC.mood === 'paranoid' && '😨 Параноик'}
                        {currentNPC.mood === 'nostalgic' && '😔 Ностальгия'}
                        {currentNPC.mood === 'aggressive' && '😠 Агрессивный'}
                      </span>
                    </div>

                    {/* Characteristics */}
                    <div className="npc-result-characteristics">
                      {/* Background */}
                      <div className="npc-result-characteristic">
                        <div className="npc-result-characteristic-icon">
                          {categoryIcons.background}
                        </div>
                        <div className="npc-result-characteristic-content">
                          <p className="npc-result-characteristic-label">Профессия</p>
                          <p className="npc-result-characteristic-value">
                            {currentNPC.background}
                          </p>
                        </div>
                      </div>

                      {/* Physical quirk */}
                      <div className="npc-result-characteristic">
                        <div className="npc-result-characteristic-icon">
                          {categoryIcons.physicalQuirk}
                        </div>
                        <div className="npc-result-characteristic-content">
                          <p className="npc-result-characteristic-label">Внешность</p>
                          <p className="npc-result-characteristic-value">
                            {currentNPC.physicalQuirk}
                          </p>
                        </div>
                      </div>

                      {/* Smell */}
                      <div className="npc-result-characteristic">
                        <div className="npc-result-characteristic-icon">
                          {categoryIcons.smell}
                        </div>
                        <div className="npc-result-characteristic-content">
                          <p className="npc-result-characteristic-label">Запах</p>
                          <p className="npc-result-characteristic-value">
                            {currentNPC.smell}
                          </p>
                        </div>
                      </div>

                      {/* Speech pattern */}
                      <div className="npc-result-characteristic">
                        <div className="npc-result-characteristic-icon">
                          {categoryIcons.speechPattern}
                        </div>
                        <div className="npc-result-characteristic-content">
                          <p className="npc-result-characteristic-label">Речь</p>
                          <p className="npc-result-characteristic-value">
                            {currentNPC.speechPattern}
                          </p>
                        </div>
                      </div>

                      {/* Secret trade */}
                      <div className="npc-result-characteristic">
                        <div className="npc-result-characteristic-icon">
                          {categoryIcons.secretTrade}
                        </div>
                        <div className="npc-result-characteristic-content">
                          <p className="npc-result-characteristic-label">Торговля</p>
                          <p className="npc-result-characteristic-value">
                            {currentNPC.secretTrade}
                          </p>
                        </div>
                      </div>

                      {/* Lies about */}
                      <div className="npc-result-characteristic">
                        <div className="npc-result-characteristic-icon">
                          {categoryIcons.lyingAbout}
                        </div>
                        <div className="npc-result-characteristic-content">
                          <p className="npc-result-characteristic-label">Врёт про</p>
                          <p className="npc-result-characteristic-value">
                            {currentNPC.lyingAbout}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Full description */}
                    <div className="pt-4 border-t border-rgba(217, 119, 6, 0.2)">
                      <p className="text-amber-200/60 text-xs font-semibold uppercase mb-2 tracking-wide">
                        📖 Краткое описание
                      </p>
                      <p className="text-amber-100/80 text-sm leading-relaxed italic">
                        {formatNPCDescription(currentNPC)}
                      </p>
                    </div>
                  </div>

                  {/* Footer buttons */}
                  <div className="drunk-innkeeper-modal-footer">
                    <button
                      onClick={() => handleGenerate()}
                      disabled={isLoading}
                      className="drunk-innkeeper-btn-generate"
                      title="Сгенерировать нового персонажа"
                    >
                      🎲 Ещё одного!
                    </button>
                    <button
                      onClick={handleAddNPC}
                      disabled={isLoading}
                      className="drunk-innkeeper-btn-save"
                      title="Сохранить персонажа"
                    >
                      {isLoading ? '⏳ Сохраняю...' : '➕ Добавить NPC'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4 text-lg">
                    Нажмите кнопку ниже, чтобы встретить нового постояльца...
                  </p>
                  <button
                    onClick={() => handleGenerate()}
                    disabled={isLoading}
                    className="drunk-innkeeper-btn-generate w-full py-4 text-lg"
                  >
                    🎲 Встретить постояльца
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
