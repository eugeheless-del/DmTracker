import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <div className="inventory-modal-overlay">
      <div className="inventory-modal-backdrop" />
      <div className="inventory-modal-panel">
        <div className="inventory-modal-header">
          <div>
            <p className="inventory-modal-tag">Инвентарь персонажа</p>
            <h2 className="inventory-modal-title">🎒 {pc.name}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть модальное окно"
            className="inventory-modal-close-btn"
          >
            ✕
          </button>
        </div>

        <div className="inventory-modal-body">
          <section className="inventory-modal-section inventory-modal-form">
            <div className="inventory-modal-section-header">
              <p className="inventory-modal-section-title">➕ Добавить предмет</p>
              <p className="inventory-modal-section-subtitle">Создайте новый предмет с количеством и описанием.</p>
            </div>

            <form onSubmit={handleAddItem} className="inventory-modal-form-grid">
              <label className="form-control">
                <span className="label">Название *</span>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Введите название предмета"
                  className="input inventory-modal-input"
                />
              </label>

              <label className="form-control">
                <span className="label">Количество</span>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || 1)}
                  min="1"
                  placeholder="1"
                  className="input inventory-modal-input"
                />
              </label>

              <label className="form-control">
                <span className="label">Описание</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Дополнительное описание предмета (опционально)"
                  rows={4}
                  className="textarea inventory-modal-textarea"
                />
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn--primary inventory-modal-add-btn"
              >
                {isLoading ? 'Загрузка...' : 'Добавить'}
              </button>
            </form>
          </section>

          <section className="inventory-modal-section inventory-modal-list-section">
            <div className="inventory-modal-section-header">
              <p className="inventory-modal-section-title">📦 Текущий инвентарь</p>
              <p className="inventory-modal-section-subtitle">Всего предметов: {inventory.length}</p>
            </div>

            {inventory.length === 0 ? (
              <div className="inventory-modal-empty">
                Инвентарь пуст. Добавьте первый предмет выше.
              </div>
            ) : (
              <div className="inventory-modal-list">
                {inventory.map((item) => (
                  <article key={item.id} className="inventory-modal-item">
                    <div className="inventory-modal-item-info">
                      <p className="inventory-modal-item-name">{item.item_name || 'Без названия'}</p>
                      <p className="inventory-modal-item-meta">Кол-во: <span>{item.quantity || 0}</span></p>
                      {item.description && (
                        <p className="inventory-modal-item-description">{item.description}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="inventory-modal-delete-btn"
                      title="Удалить предмет"
                    >
                      ✕
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
