import { useState } from 'react';
import { useStore } from '../store';
import { Twist } from '../types';
import { TwistForm } from '../components/TwistForm';
import { TwistCard } from '../components/TwistCard';

function Twists() {
  const { twists, addTwist, updateTwist, deleteTwist } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTwist, setEditingTwist] = useState<Twist | undefined>();

  // Handle new twist
  const handleNewTwist = () => {
    setEditingTwist(undefined);
    setShowForm(true);
  };

  // Handle twist submit (create or update)
  const handleTwistSubmit = async (data: any) => {
    try {
      if (editingTwist) {
        await updateTwist(editingTwist.id, data);
      } else {
        await addTwist(data);
      }
      setShowForm(false);
      setEditingTwist(undefined);
    } catch (error) {
      alert('Ошибка при сохранении твиста. Попробуйте снова.');
      console.warn('Failed to submit twist:', error);
    }
  };

  // Handle twist edit
  const handleEditTwist = (twist: Twist) => {
    setEditingTwist(twist);
    setShowForm(true);
  };

  // Handle twist delete
  const handleDeleteTwist = async (twist: Twist) => {
    if (window.confirm(`Удалить твист "${twist.title}"?`)) {
      try {
        await deleteTwist(twist.id);
      } catch (error) {
        alert('Ошибка при удалении твиста. Попробуйте снова.');
        console.warn('Failed to delete twist:', error);
      }
    }
  };

  // Handle status change
  const handleStatusChange = async (twistId: string, newStatus: Twist['status']) => {
    try {
      await updateTwist(twistId, { status: newStatus });
    } catch (error) {
      alert('Ошибка при изменении статуса. Попробуйте снова.');
      console.warn('Failed to update twist status:', error);
    }
  };

  return (
    <div className="section space-y-6">
      <div className="flex-between gap-sm">
        <h2 className="h2">✨ Твисты</h2>
        <button
          onClick={handleNewTwist}
          className="btn btn--primary"
        >
          + Новый твист
        </button>
      </div>

      {/* Show form modal */}
      {showForm && (
        <TwistForm
          twist={editingTwist}
          onSubmit={handleTwistSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingTwist(undefined);
          }}
        />
      )}

      {/* Empty state */}
      {twists.length === 0 ? (
        <div className="card card--bordered text-center">
          <p className="h3 mb-2 text-muted">Пока нет твистов</p>
          <p className="small text-muted">Нажмите кнопку выше, чтобы добавить первый</p>
        </div>
      ) : (
        // List of twists
        <div className="grid gap-lg">
          {twists.map((twist) => (
            <TwistCard
              key={twist.id}
              twist={twist}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTwist}
              onDelete={handleDeleteTwist}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Twists;
