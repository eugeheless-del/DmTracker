import { useState } from 'react';
import { useStore } from '../store';
import { Session } from '../types';
import ReactMarkdown from 'react-markdown';

function Sessions() {
  const { sessions, pcs, addSession, updateSession, deleteSession } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    notes: '',
    selectedPcIds: [] as string[],
  });
  const [showPreview, setShowPreview] = useState(false);

  // Handle new session
  const handleNewSession = () => {
    setEditingSession(undefined);
    setFormData({ name: '', description: '', date: '', notes: '', selectedPcIds: [] });
    setShowForm(true);
  };

  // Handle session submit
  const handleSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Введите название сессии');
      return;
    }

    if (editingSession) {
      updateSession(editingSession.id, {
        name: formData.name,
        description: formData.description,
        date: formData.date ? new Date(formData.date).getTime() : undefined,
        notes: formData.notes,
        twistIds: editingSession.twistIds,
        npcIds: editingSession.npcIds,
        pcIds: formData.selectedPcIds,
      });
    } else {
      addSession({
        name: formData.name,
        description: formData.description,
        date: formData.date ? new Date(formData.date).getTime() : undefined,
        notes: formData.notes,
        twistIds: [],
        npcIds: [],
        pcIds: formData.selectedPcIds,
      });
    }
    setShowForm(false);
    setEditingSession(undefined);
    setFormData({ name: '', description: '', date: '', notes: '', selectedPcIds: [] });
  };

  // Handle session edit
  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    const dateStr = session.date
      ? new Date(session.date).toISOString().split('T')[0]
      : '';
    setFormData({
      name: session.name,
      description: session.description || '',
      date: dateStr,
      notes: session.notes || '',
      selectedPcIds: session.pcIds || [],
    });
    setShowForm(true);
  };

  // Handle session delete
  const handleDeleteSession = (session: Session) => {
    if (window.confirm(`Удалить сессию "${session.name}"?`)) {
      deleteSession(session.id);
    }
  };

  // Format date for display (date only, no time)
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Дата не указана';
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingSession ? 'Редактировать сессию' : 'Новая сессия'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingSession(undefined);
                }}
                className="text-slate-400 hover:text-slate-200 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSessionSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Название сессии</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Сессия 1"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Описание</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Короткое описание события сессии"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">Дата сессии</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Player Characters Selection */}
                {pcs.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-3">Персонажи игроков</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                      {pcs.map((pc) => (
                        <label key={pc.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.selectedPcIds.includes(pc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  selectedPcIds: [...formData.selectedPcIds, pc.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedPcIds: formData.selectedPcIds.filter(id => id !== pc.id),
                                });
                              }
                            }}
                            className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                          />
                          <span className="text-sm text-slate-100">{pc.name}</span>
                          {pc.playerName && (
                            <span className="text-xs text-slate-400">({pc.playerName})</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Log / Notes with Tabs */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        !showPreview
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Редактирование
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        showPreview
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Превью
                    </button>
                  </div>

                  {!showPreview ? (
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="flex-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono text-sm resize-none"
                      placeholder="Лог сессии... поддерживает Markdown"
                    />
                  ) : (
                    <div className="flex-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white overflow-y-auto">
                      <div className="prose prose-invert max-w-none text-sm">
                        <ReactMarkdown>{formData.notes}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-700 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSession(undefined);
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  {editingSession ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
                  {session.pcIds && session.pcIds.length > 0 && (
                    <div className="text-xs text-blue-300 mt-2">
                      <span className="font-medium">🧙 Персонажи:</span>{' '}
                      {session.pcIds
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
