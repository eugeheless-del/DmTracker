import { useState } from 'react';
import { useStore } from '../store';
import { Twist } from '../types';
import { TwistForm } from '../components/TwistForm';
import { TwistCard } from '../components/TwistCard';

interface TwistsProps {
  onNavigateToCharacter?: () => void;
}

function Twists({ onNavigateToCharacter }: TwistsProps) {
  const { twists, addTwist, updateTwist, deleteTwist } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTwist, setEditingTwist] = useState<Twist | undefined>();

  // Handle new twist
  const handleNewTwist = () => {
    setEditingTwist(undefined);
    setShowForm(true);
  };

  // Handle twist submit (create or update)
  const handleTwistSubmit = (data: any) => {
    if (editingTwist) {
      updateTwist(editingTwist.id, data);
    } else {
      addTwist(data);
    }
    setShowForm(false);
    setEditingTwist(undefined);
  };

  // Handle twist edit
  const handleEditTwist = (twist: Twist) => {
    setEditingTwist(twist);
    setShowForm(true);
  };

  // Handle twist delete
  const handleDeleteTwist = (twist: Twist) => {
    if (window.confirm(`Удалить твист "${twist.name}"?`)) {
      deleteTwist(twist.id);
    }
  };

  // Handle status change
  const handleStatusChange = (twistId: string, newStatus: Twist['status']) => {
    updateTwist(twistId, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">✨ Твисты</h2>
        <button
          onClick={handleNewTwist}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
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
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center text-slate-400">
          <p className="text-lg mb-2">Пока нет твистов</p>
          <p className="text-sm">Нажмите кнопку выше, чтобы добавить первый</p>
        </div>
      ) : (
        // List of twists
        <div className="grid gap-6">
          {twists.map((twist) => (
            <TwistCard
              key={twist.id}
              twist={twist}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTwist}
              onDelete={handleDeleteTwist}
              onCharacterClick={() => onNavigateToCharacter?.()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Twists;
