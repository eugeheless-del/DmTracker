import { useState } from 'react';
import { useStore } from '../store';

function Dashboard() {
  const { pcs, twists, sessions } = useStore();
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('dm_tracker_quick_notes');
    return saved || '';
  });

  // Save notes to localStorage
  const handleNotesChange = (value: string) => {
    setNotes(value);
    localStorage.setItem('dm_tracker_quick_notes', value);
  };

  // Count active twists (not completed)
  const activeTwists = twists.filter((t) => t.status !== 'completed');

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">📊 Dashboard</h2>

      {/* Stats Cards - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Twists */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="text-sm text-slate-400 mb-2">✨ Активные твисты</div>
          <div className="text-3xl font-bold text-amber-400">{activeTwists.length}</div>
          <p className="text-xs text-slate-500 mt-2">из {twists.length} всего</p>
        </div>

        {/* Player Characters */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="text-sm text-slate-400 mb-2">🧙 Персонажей игроков</div>
          <div className="text-3xl font-bold text-blue-400">{pcs.length}</div>
          <p className="text-xs text-slate-500 mt-2">Игроков в команде</p>
        </div>
      </div>

      {/* Quick Notes */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-3 flex flex-col min-h-64">
        <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
          <span>📝</span> Быстрые заметки
        </h3>
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Напишите что угодно: идеи, важные события, информацию о врагах..."
          className="flex-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-green-500 font-mono resize-none min-h-40"
        />
        <p className="text-xs text-slate-500">💾 Автоматически сохраняется в браузере</p>
      </div>

      {/* Sessions with Characters */}
      {sessions.length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
          <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <span>📅</span> Сессии и персонажи
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {sessions
              .filter((s) => s.pcIds && s.pcIds.length > 0)
              .slice(-5)
              .reverse()
              .map((session) => (
                <div key={session.id} className="bg-slate-700/50 rounded p-3 border-l-2 border-cyan-500">
                  <p className="font-medium text-slate-100 text-sm">{session.name}</p>
                  <div className="text-xs text-slate-300 mt-1">
                    🧙{' '}
                    {session.pcIds
                      .map((pcId) => pcs.find((pc) => pc.id === pcId))
                      .filter((pc): pc is typeof pcs[0] => Boolean(pc))
                      .map((pc) => `${pc.name}${pc.playerName ? ` (${pc.playerName})` : ''}`)
                      .join(', ')}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Active Twists Warning */}
      {activeTwists.length > 0 && (
        <div className="bg-amber-900/30 border border-amber-800 rounded-lg p-4 text-amber-200 text-sm">
          <p className="font-medium mb-1">⚠️ Активные твисты</p>
          <p className="text-xs text-amber-100/80">
            У вас есть {activeTwists.length} активных твистов! Перейдите на вкладку "Твисты" для управления.
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
