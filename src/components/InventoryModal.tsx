import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { PC } from '../types';

interface InventoryModalProps {
  pc: PC;
  onClose: () => void;
}

/**
 * Modal for managing PC inventory
 * - Display and add inventory items
 * - Load inventory from Supabase on open
 * - Form stays open after adding item
 * - Inventory updates instantly when new items are added
 */
export default function InventoryModal({ pc: initialPc, onClose }: InventoryModalProps) {
  // Subscribe to store changes and get fresh PC data
  const pcs = useStore((state) => state.pcs);
  const { addInventoryItem, deleteInventoryItem, loadInventoryForPc } = useStore();
  
  // Get current PC from store to ensure inventory updates are reflected
  const pc = useMemo(() => pcs.find((p) => p.id === initialPc.id) || initialPc, [pcs, initialPc.id]);

  // Local form state
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load inventory on modal open
  useEffect(() => {
    const loadInventory = async () => {
      setIsLoading(true);
      try {
        await loadInventoryForPc(pc.id);
      } catch (error) {
        console.warn('Failed to load inventory:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInventory();
  }, [pc.id, loadInventoryForPc]);

  // Handle add item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required field
    if (!itemName.trim()) {
      alert('Введите название предмета');
      return;
    }

    try {
      await addInventoryItem(pc.id, {
        item_name: itemName.trim(),
        quantity: typeof quantity === 'number' && quantity > 0 ? quantity : 1,
        description: description.trim() || undefined,
      });

      // Clear form but keep modal open
      setItemName('');
      setQuantity(1);
      setDescription('');
    } catch (error) {
      alert('Ошибка при добавлении предмета');
      console.warn('Failed to add inventory item:', error);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Удалить предмет из инвентаря?')) {
      try {
        await deleteInventoryItem(itemId);
      } catch (error) {
        alert('Ошибка при удалении предмета');
        console.warn('Failed to delete inventory item:', error);
      }
    }
  };

  const inventory = pc.inventory || [];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-60">
      <div className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">🎒 Инвентарь: {pc.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Add Item Form */}
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <h3 className="text-lg font-bold mb-4 text-green-400">➕ Добавить предмет</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Название *</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Введите название предмета"
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-2">Количество</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
                  min="1"
                  placeholder="1"
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Дополнительное описание предмета (опционально)"
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

          {/* Inventory List */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-400">
              📦 Инвентарь ({inventory.length})
            </h3>

            {inventory.length === 0 ? (
              <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 text-center text-slate-400">
                Инвентарь пуст. Добавьте первый предмет выше.
              </div>
            ) : (
              <div className="space-y-3">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-700 rounded-lg p-4 border border-slate-600 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Item Name */}
                      <p className="font-bold text-white truncate">
                        {item.item_name || 'Без названия'}
                      </p>

                      {/* Quantity */}
                      <p className="text-sm text-slate-300">
                        Кол-во: <span className="font-semibold">{item.quantity || 0}</span>
                      </p>

                      {/* Description */}
                      {item.description && (
                        <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors whitespace-nowrap text-sm flex-shrink-0"
                      title="Удалить предмет"
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
