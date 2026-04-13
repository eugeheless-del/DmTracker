import { useState } from 'react';
import { useStore } from '../store';

function Dashboard() {
  const { pcs, twists } = useStore();
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

  // Calculate total HP
  const totalHp = pcs.reduce((sum, pc) => sum + (pc.hp || 0), 0);
  const totalMaxHp = pcs.reduce((sum, pc) => sum + (pc.maxHp || 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">📊 Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <p className="text-xs text-slate-500 mt-2">Игроков в комании</p>
        </div>

        {/* Total HP */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="text-sm text-slate-400 mb-2">❤️ Здоровье группы</div>
          <div className="text-3xl font-bold text-red-400">
            {totalHp}/{totalMaxHp}
          </div>
          <p className="text-xs text-slate-500 mt-2">{totalMaxHp > 0 ? Math.round((totalHp / totalMaxHp) * 100) : 0}% HP</p>
        </div>

        {/* Sessions Count */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="text-sm text-slate-400 mb-2">📅 Всего информации</div>
          <div className="text-3xl font-bold text-purple-400">{pcs.length + twists.length}</div>
          <p className="text-xs text-slate-500 mt-2">персонажей + твистов</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PC HP List */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-3">
          <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
            <span>🧙</span> HP игроков
          </h3>

          {pcs.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Нет персонажей</p>
          ) : (
            <div className="space-y-2">
              {pcs.map((pc) => {
                const hpPercent = pc.maxHp ? (pc.hp || 0) / pc.maxHp : 0;
                const healthColor =
                  hpPercent > 0.5 ? 'bg-green-600' : hpPercent > 0.25 ? 'bg-yellow-600' : 'bg-red-600';

                return (
                  <div key={pc.id} className="bg-slate-700 rounded p-2 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{pc.name}</span>
                      <span className="text-slate-300 text-xs ml-2 whitespace-nowrap">
                        {pc.hp}/{pc.maxHp}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded h-2 overflow-hidden">
                      <div
                        className={`h-full ${healthColor} transition-all`}
                        style={{ width: `${hpPercent * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Notes */}
        <div className="lg:col-span-2 bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-3 flex flex-col">
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
      </div>

      {/* Info Box */}
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
