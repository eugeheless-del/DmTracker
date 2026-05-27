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
    <div className="section space-y-6">
      <div className="flex-between gap-sm flex-wrap">
        <h2 className="h2">📅 Сессии</h2>
        <button
          onClick={handleNewSession}
          className="btn btn--primary"
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
        <div className="card card--bordered text-center">
          <p className="h3 mb-2 text-muted">Пока нет сессий</p>
          <p className="small text-muted">Нажмите кнопку выше, чтобы создать первую</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {sessions
            .slice()
            .reverse()
            .map((session) => (
              <div
                key={session.id}
                className="card card--bordered space-y-3"
              >
                <div className="space-y-1">
                  <h3 className="h3 text-white">{session.name}</h3>
                  {session.description && (
                    <p className="small text-muted">{session.description}</p>
                  )}
                  <p className="small text-muted">{formatDate(session.date)}</p>
                  {session.pc_ids && session.pc_ids.length > 0 && (
                    <div className="small text-primary mt-2">
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
                  <div className="card bg-card rounded-lg p-3 max-h-32 overflow-y-auto">
                    <p className="small text-muted line-clamp-4">{session.notes}</p>
                  </div>
                )}

                <div className="flex gap-sm justify-end pt-2">
                  <button
                    onClick={() => handleEditSession(session)}
                    className="btn btn--secondary"
                  >
                    ✎ Редактировать
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session)}
                    className="btn btn--danger"
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

