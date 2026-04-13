import { useState } from 'react';
import { useStore } from '../store';
import { TwistCard } from '../components/TwistCard';
import { Twist } from '../types';

export default function Twists() {
  // Get twists from store
  const twists = useStore((state) => state.twists);
  const updateTwist = useStore((state) => state.updateTwist);
  const deleteTwist = useStore((state) => state.deleteTwist);
  const addTwist = useStore((state) => state.addTwist);

  // Filter state
  const [activeFilterStatus, setActiveFilterStatus] = useState<'all' | Twist['status']>('all');

  // Modal state for editing/creating twists
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTwist, setEditingTwist] = useState<Twist | undefined>(undefined);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    trigger: '',
    description: '',
    consequence: '',
    type: 'revelation' as const,
    status: 'hidden' as const,
    npcIds: [] as string[],
    pcIds: [] as string[],
  });

  // Filter twists by status
  const filteredTwists = activeFilterStatus === 'all'
    ? twists
    : twists.filter((twist) => twist.status === activeFilterStatus);

  // Get status counts
  const statusCounts = {
    all: twists.length,
    hidden: twists.filter((t) => t.status === 'hidden').length,
    ready: twists.filter((t) => t.status === 'ready').length,
    revealed: twists.filter((t) => t.status === 'revealed').length,
    completed: twists.filter((t) => t.status === 'completed').length,
  };

  // Get status label
  const getStatusLabel = (status?: string): string => {
    switch (status) {
      case 'hidden':
        return 'Скрыт';
      case 'ready':
        return 'Готов';
      case 'revealed':
        return 'Раскрыт';
      case 'completed':
        return 'Завершён';
      default:
        return 'Без статуса';
    }
  };

  // Open modal for creating new twist
  const handleAddTwist = () => {
    setEditingTwist(undefined);
    setFormData({
      name: '',
      trigger: '',
      description: '',
      consequence: '',
      type: 'revelation',
      status: 'hidden',
      npcIds: [],
      pcIds: [],
    });
    setIsModalOpen(true);
  };

  // Open modal for editing twist
  const handleEditTwist = (twist: Twist) => {
    setEditingTwist(twist);
    setFormData({
      name: twist.name || '',
      trigger: twist.trigger || '',
      description: twist.description || '',
      consequence: twist.consequence || '',
      type: twist.type || 'revelation',
      status: twist.status || 'hidden',
      npcIds: twist.npcIds || [],
      pcIds: twist.pcIds || [],
    });
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTwist(undefined);
    setFormData({
      name: '',
      trigger: '',
      description: '',
      consequence: '',
      type: 'revelation',
      status: 'hidden',
      npcIds: [],
      pcIds: [],
    });
  };

  // Submit form
  const handleSubmitForm = () => {
    // Validate required field
    if (!formData.name.trim()) {
      alert('Укажите название твиста');
      return;
    }

    if (editingTwist && editingTwist.id) {
      // Update existing twist
      updateTwist(editingTwist.id, formData);
    } else {
      // Create new twist
      addTwist(formData);
    }

    handleCloseModal();
  };

  // Handle twist status change (with notification for 'revealed')
  const handleStatusChange = (twistId: string, newStatus: Twist['status']) => {
    updateTwist(twistId, { status: newStatus });
    
    // Show toast-like notification for 'revealed' status
    if (newStatus === 'revealed') {
      const twist = twists.find((t) => t.id === twistId);
      if (twist) {
        // Show notification (placeholder - can be replaced with toast library)
        console.log(`✨ Твист "${twist.name}" раскрыт!`);
        // Using browser's notification API as a temporary solution
        if (Notification.permission === 'granted') {
          new Notification(`✨ ${twist.name}`, {
            body: 'Твист раскрыт!',
            icon: '✨',
          });
        }
      }
    }
  };

  // Handle twist deletion
  const handleDeleteTwist = (twist: Twist) => {
    if (confirm(`Удалить твист "${twist.name}"?`)) {
      deleteTwist(twist.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">✨ Твисты</h1>
        <button
          onClick={handleAddTwist}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors"
        >
          + Добавить твист
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 border-b border-slate-700 overflow-x-auto pb-2">
        {(['all', 'hidden', 'ready', 'revealed', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilterStatus(status)}
            className={`px-4 py-2 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${
              activeFilterStatus === status
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            {status === 'all' ? '📋 Все' : getStatusLabel(status)}
            {' '}
            <span className="text-xs opacity-75">({statusCounts[status]})</span>
          </button>
        ))}
      </div>

      {/* Twists list */}
      {filteredTwists.length > 0 ? (
        <div className="space-y-4">
          {filteredTwists.map((twist) => (
            <TwistCard
              key={twist.id}
              twist={twist}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTwist}
              onDelete={handleDeleteTwist}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">
            {twists.length === 0 ? 'Твистов пока нет' : 'Твистов с таким статусом не найдено'}
          </p>
        </div>
      )}

      {/* Modal for edit/create twist */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingTwist ? 'Редактировать твист' : 'Новый твист'}
            </h2>

            {/* Form fields */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="Название твиста"
                />
              </div>

              {/* Trigger */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Триггер (условие)
                </label>
                <input
                  type="text"
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="Что активирует твист?"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Подробное описание"
                  rows={3}
                />
              </div>

              {/* Consequence */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Последствие
                </label>
                <textarea
                  value={formData.consequence}
                  onChange={(e) => setFormData({ ...formData, consequence: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Что произойдёт, если твист сработает?"
                  rows={2}
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Тип
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="revelation">Откровение</option>
                  <option value="enemy">Враг</option>
                  <option value="opportunity">Возможность</option>
                  <option value="obstacle">Препятствие</option>
                  <option value="alliance">Союз</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="hidden">Скрыт</option>
                  <option value="ready">Готов</option>
                  <option value="revealed">Раскрыт</option>
                  <option value="completed">Завершён</option>
                </select>
              </div>

              {/* NPC/PC IDs (placeholder for future linking) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Связанные ID НПЛ (текст, через запятую)
                </label>
                <input
                  type="text"
                  value={formData.npcIds.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      npcIds: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs"
                  placeholder="id1, id2, id3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Связанные ID ПЛ (текст, через запятую)
                </label>
                <input
                  type="text"
                  value={formData.pcIds.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pcIds: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs"
                  placeholder="id1, id2, id3"
                />
              </div>
            </div>

            {/* Modal buttons */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSubmitForm}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
