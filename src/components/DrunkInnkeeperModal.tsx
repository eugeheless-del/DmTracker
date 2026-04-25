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
        // Use custom save handler if provided
        await customOnSave(npcInput);
      } else {
        // Use default save handler
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

  // Badge styling based on mood
  const getMoodColor = (mood: string) => {
    const moodColors = {
      'drunk': 'bg-amber-900 text-amber-200',
      'paranoid': 'bg-red-900 text-red-200',
      'nostalgic': 'bg-blue-900 text-blue-200',
      'aggressive': 'bg-rose-900 text-rose-200',
    };
    return moodColors[mood as keyof typeof moodColors] || 'bg-slate-700 text-slate-200';
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
          className="fixed bottom-6 right-6 z-40 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 text-sm"
        >
          <span className="text-lg">🍺</span>
          Пьяный Трактирщик
        </button>
      )}

      {/* Modal backdrop and container */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          {/* Modal window */}
          <div
            className="bg-slate-900 border border-amber-700 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Notification */}
            {notification && (
              <div className="mb-4 p-3 bg-slate-800 border border-amber-500 rounded-lg text-center text-amber-200 font-semibold">
                {notification}
              </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🍺</span>
              <h2 className="text-2xl font-bold text-amber-300">Пьяный Трактирщик</h2>
            </div>

            {/* NPC Display */}
            {currentNPC && (
              <div className="mb-6 space-y-4">
                {/* Name - large prominent display */}
                <div className="bg-gradient-to-r from-amber-900 to-amber-800 rounded-lg p-4 border border-amber-600">
                  <p className="text-xs text-amber-200 font-semibold uppercase tracking-wide mb-1">Имя постояльца</p>
                  <h3 className="text-3xl font-bold text-amber-100">{currentNPC.name}</h3>
                </div>

                {/* Mood badge */}
                <div className="flex justify-center">
                  <span className={`px-4 py-1 rounded-full font-semibold text-sm ${getMoodColor(currentNPC.mood)}`}>
                    {currentNPC.mood === 'drunk' && '🥴 Пьян'}
                    {currentNPC.mood === 'paranoid' && '😨 Параноик'}
                    {currentNPC.mood === 'nostalgic' && '😔 Ностальгия'}
                    {currentNPC.mood === 'aggressive' && '😠 Агрессивный'}
                  </span>
                </div>

                {/* Characteristics with icons and colored badges */}
                <div className="space-y-3">
                  {/* Background */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{categoryIcons.background}</span>
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Профессия</p>
                      <p className="bg-slate-800 rounded px-3 py-2 text-amber-100 text-sm">{currentNPC.background}</p>
                    </div>
                  </div>

                  {/* Physical quirk */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{categoryIcons.physicalQuirk}</span>
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Внешность</p>
                      <p className="bg-slate-800 rounded px-3 py-2 text-amber-100 text-sm">{currentNPC.physicalQuirk}</p>
                    </div>
                  </div>

                  {/* Smell */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{categoryIcons.smell}</span>
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Запах</p>
                      <p className="bg-slate-800 rounded px-3 py-2 text-amber-100 text-sm">{currentNPC.smell}</p>
                    </div>
                  </div>

                  {/* Speech pattern */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{categoryIcons.speechPattern}</span>
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Речь</p>
                      <p className="bg-slate-800 rounded px-3 py-2 text-amber-100 text-sm">{currentNPC.speechPattern}</p>
                    </div>
                  </div>

                  {/* Secret trade */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{categoryIcons.secretTrade}</span>
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Торговля</p>
                      <p className="bg-slate-800 rounded px-3 py-2 text-amber-100 text-sm">{currentNPC.secretTrade}</p>
                    </div>
                  </div>

                  {/* Lies about */}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{categoryIcons.lyingAbout}</span>
                    <div className="flex-1">
                      <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Врёт про</p>
                      <p className="bg-slate-800 rounded px-3 py-2 text-amber-100 text-sm">{currentNPC.lyingAbout}</p>
                    </div>
                  </div>
                </div>

                {/* Full description */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                  <p className="text-slate-400 text-xs font-semibold uppercase mb-2">Краткое описание</p>
                  <p className="text-amber-100 text-sm leading-relaxed italic">{formatNPCDescription(currentNPC)}</p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap justify-end">
              <button
                onClick={() => handleGenerate()}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎲 Ещё одного!
              </button>

              <button
                onClick={handleAddNPC}
                disabled={isLoading || !currentNPC}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '⏳ Сохраняю...' : '✅ Добавить к NPC'}
              </button>

              <button
                onClick={handleClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                ✕ Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
