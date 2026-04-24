import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Session } from '../types';
import { SessionForm } from '../components/SessionForm';

function Sessions() {
  const { sessions, pcs, addSession, updateSession, deleteSession, loadFromSupabase } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | undefined>();

  // Load sessions on mount
  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  // Handle new session
  const handleNewSession = () => {
    setEditingSession(undefined);
    setShowForm(true);
  };

  // Handle session edit
  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setShowForm(true);
  };

  // Handle session delete
  const handleDeleteSession = async (session: Session) => {
    if (window.confirm(`Удалить сессию "${session.name}"?`)) {
      try {
        await deleteSession(session.id);
      } catch (error) {
        console.error('Failed to delete session:', error);
        alert('Ошибка при удалении сессии. Попробуйте снова.');
      }
    }
  };

  // Format date for display (YYYY-MM-DD string)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Дата не указана';
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Некорректная дата';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-3xl font-bold">📅 Сессии</h2>
        <button
          onClick={handleNewSession}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-sm"
        >
          + Новая сессия
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <SessionForm
          session={editingSession}
          availablePCs={pcs}
          onSubmit={async (formData) => {
            if (editingSession) {
              await updateSession(editingSession.id, {
                ...formData,
                twist_ids: editingSession.twist_ids,
                npc_ids: editingSession.npc_ids,
              });
            } else {
              await addSession(formData);
            }
            setShowForm(false);
            setEditingSession(undefined);
          }}
          onClose={() => {
            setShowForm(false);
            setEditingSession(undefined);
          }}
        />
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center text-slate-400">
          <p className="text-lg mb-2">Пока нет сессий</p>
          <p className="text-sm">Нажмите кнопку выше, чтобы создать первую</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sessions
            .slice()
            .reverse()
            .map((session) => (
              <div
                key={session.id}
                className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-3 hover:border-slate-600 transition-colors"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">{session.name}</h3>
                  {session.description && (
                    <p className="text-sm text-slate-300">{session.description}</p>
                  )}
                  <p className="text-xs text-slate-400">{formatDate(session.date)}</p>
                  {session.pc_ids && session.pc_ids.length > 0 && (
                    <div className="text-xs text-blue-300 mt-2">
                      <span className="font-medium">🧙 Персонажи:</span>{' '}
                      {session.pc_ids
                        .map((pcId) => pcs.find((pc) => pc.id === pcId))
                        .filter((pc): pc is typeof pcs[0] => Boolean(pc))
                        .map((pc) => pc.name)
                        .join(', ')}
                    </div>
                  )}
                </div>

                {session.notes && (
                  <div className="bg-slate-700 rounded p-3 max-h-32 overflow-y-auto">
                    <p className="text-xs text-slate-300 line-clamp-4">{session.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => handleEditSession(session)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                  >
                    ✎ Редактировать
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                  >
                     Удалить
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default Sessions;

