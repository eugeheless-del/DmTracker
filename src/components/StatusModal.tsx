import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store';
import { PC } from '../types';

interface StatusModalProps {
  pc: PC;
  onClose: () => void;
}

/**
 * Modal for managing PC status effects
 * - Display and add status effects
 * - Load statuses from Supabase on open
 * - Form stays open after adding status
 */
export default function StatusModal({ pc, onClose }: StatusModalProps) {
  const { addStatus, deleteStatus } = useStore();
  const [statusName, setStatusName] = useState('');
  const [statusType, setStatusType] = useState('');
  const [isLoading] = useState(false);

  // Handle add status
  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required field
    if (!statusName.trim()) {
      alert('Введите название статуса');
      return;
    }

    try {
      await addStatus(pc.id, {
        name: statusName.trim(),
        description: statusType.trim() || undefined,
      });

      // Clear form but keep modal open
      setStatusName('');
      setStatusType('');
    } catch (error) {
      alert('Ошибка при добавлении статуса');
      console.warn('Failed to add status effect:', error);
    }
  };

  // Handle delete status
  const handleDeleteStatus = async (statusId: string) => {
    if (window.confirm('Удалить статус?')) {
      try {
        await deleteStatus(statusId);
      } catch (error) {
        alert('Ошибка при удалении статуса');
        console.warn('Failed to delete status effect:', error);
      }
    }
  };

  const statuses = pc.statuses || [];

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-[1001] bg-[rgba(20,24,38,0.95)] border border-[rgba(86,128,233,0.35)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950/95 border-b border-[rgba(86,128,233,0.15)] p-6 flex items-center justify-between backdrop-blur-md">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300 mb-2">Статусы персонажа</p>
            <h2 className="text-3xl font-semibold text-white">{pc.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Add Status Form */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-600/60 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-blue-300">➕ Добавить статус</h3>
            <form onSubmit={handleAddStatus} className="space-y-4">
              {/* Status Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Название статуса *</label>
                <input
                  type="text"
                  value={statusName}
                  onChange={(e) => setStatusName(e.target.value)}
                  placeholder="Например: Отравлен, Ослеплен"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Status Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Цвет / Тип</label>
                <input
                  type="text"
                  value={statusType}
                  onChange={(e) => setStatusType(e.target.value)}
                  placeholder="Например: Ярко-синий, Дебафф"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/20 transition hover:from-blue-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Загрузка...' : '✓ Добавить'}
              </button>
            </form>
          </div>

          {/* Status List */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-300">✨ Активные статусы ({statuses.length})</h3>

            {statuses.length === 0 ? (
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-600/60 text-center text-slate-400">
                Нет активных статусов. Добавьте первый статус выше.
              </div>
            ) : (
              <div className="space-y-3">
                {statuses.map((status) => (
                  <div
                    key={status.id}
                    className="bg-slate-800/50 rounded-2xl p-4 border border-slate-600/60 flex items-start justify-between gap-4 backdrop-blur-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{status.name || 'Без названия'}</p>
                      {status.description && (
                        <p className="text-sm text-slate-400 mt-2">{status.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteStatus(status.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-2xl font-medium transition-colors whitespace-nowrap text-sm flex-shrink-0"
                      title="Удалить статус"
                    >
                      🗑️ Удалить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-950/95 border-t border-[rgba(86,128,233,0.15)] p-6 flex justify-end gap-3 backdrop-blur-md">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600 rounded-2xl text-white font-medium transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
