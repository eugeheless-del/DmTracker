import { useState, useEffect } from 'react';
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
  const [statusDescription, setStatusDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        description: statusDescription.trim() || undefined,
      });

      // Clear form but keep modal open
      setStatusName('');
      setStatusDescription('');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">✨ Статусы: {pc.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Add Status Form */}
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <h3 className="text-lg font-bold mb-4 text-green-400">➕ Добавить статус</h3>
            <form onSubmit={handleAddStatus} className="space-y-4">
              {/* Status Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Название статуса *</label>
                <input
                  type="text"
                  value={statusName}
                  onChange={(e) => setStatusName(e.target.value)}
                  placeholder="Введите название статуса (например: Отравлен, Ослеплен)"
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Status Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  value={statusDescription}
                  onChange={(e) => setStatusDescription(e.target.value)}
                  placeholder="Дополнительное описание статуса или условия (опционально)"
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Загрузка...' : '✓ Добавить'}
              </button>
            </form>
          </div>

          {/* Status List */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-400">
              ✨ Активные статусы ({statuses.length})
            </h3>

            {statuses.length === 0 ? (
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 text-center text-slate-400">
                Нет активных статусов. Добавьте первый статус выше.
              </div>
            ) : (
              <div className="space-y-3">
                {statuses.map((status) => (
                  <div
                    key={status.id}
                    className="bg-slate-700 rounded-lg p-4 border border-slate-600 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Status Name */}
                      <p className="font-bold text-white truncate">
                        {status.name || 'Без названия'}
                      </p>

                      {/* Status Description */}
                      {status.description && (
                        <p className="text-sm text-slate-400 mt-2 line-clamp-3">
                          {status.description}
                        </p>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteStatus(status.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors whitespace-nowrap text-sm flex-shrink-0"
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
        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
