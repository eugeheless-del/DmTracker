import { useState } from 'react';
import { useStore } from '../store';
import { formatDate } from '../utils/formatDate';
import { TelegramBroadcastModal } from '../components/TelegramBroadcastModal';

function Dashboard() {
  const [showTelegramModal, setShowTelegramModal] = useState(false);
 
  const { pcs, npcs, twists, sessions } = useStore();
  if (!pcs || !npcs || !twists || !sessions) {
    return <div>Загрузка данных...</div>;
  }
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('dm_tracker_quick_notes');
    return saved || '';
  });
  
  // Debug: Log session dates to check for invalid data
  console.log('🔍 Dashboard sessions data:', sessions.map(s => ({
    id: s.id,
    name: s.name,
    date: s.date,
    dateType: typeof s.date,
  })));
  
  console.log('Рендерится Dashboard! Данные:', {
    pcs: pcs.length,
    npcs: npcs.length,
    twists: twists.length,
    sessions: sessions.length,
  });

  // Save notes to localStorage
  const handleNotesChange = (value: string) => {
    setNotes(value);
    localStorage.setItem('dm_tracker_quick_notes', value);
  };

  // Count active twists (not completed)
  const activeTwists = twists.filter((t) => t.status !== 'completed');

  return (

  <div className="p-6">
    {/* Тестовый блок для проверки видимости */}
    {/* <div style={{ 
      border: '4px solid #fbbf24', 
      padding: '16px', 
      marginBottom: '20px',
      backgroundColor: '#1e293b',
      color: '#fbbf24'
    }}>
      <h2 className="text-xl font-bold">🔍 DASHBOARD ЗАГРУЗИЛСЯ!</h2>
      <p>PCs: {pcs?.length || 0} | Twists: {twists?.length || 0}</p>
    </div> */}

    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">📊 Общее</h2>
        <button
          onClick={() => setShowTelegramModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all hover:shadow-lg flex items-center gap-2"
        >
          📢 Telegram
        </button>
      </div>

      {/* Stats Cards - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Player Characters */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="text-sm text-slate-400 mb-2">🧙 Персонажей игроков</div>
          <div className="text-3xl font-bold text-blue-400">{pcs.length}</div>
          <p className="text-xs text-slate-500 mt-2">Игроков в команде</p>
        </div>

        {/* NPCs */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="text-sm text-slate-400 mb-2">👹 НПС</div>
          <div className="text-3xl font-bold text-purple-400">{npcs.length}</div>
          <p className="text-xs text-slate-500 mt-2">Персонажей мира</p>
        </div>

        {/* Active Twists */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="text-sm text-slate-400 mb-2">✨ Активные твисты</div>
          <div className="text-3xl font-bold text-amber-400">{activeTwists.length}</div>
          <p className="text-xs text-slate-500 mt-2">из {twists.length} всего</p>
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
            <span>📅</span> Последние сессии
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {sessions
              .filter((s) => s.pc_ids && s.pc_ids.length > 0)
              .slice(-5)
              .reverse()
              .map((session) => (
                <div key={session.id} className="bg-slate-700/50 rounded p-3 border-l-2 border-cyan-500">
                  <p className="font-medium text-slate-100 text-sm">{session.name}</p>
                  <div className="text-xs text-slate-300 mt-1">
                    📅 {formatDate(session.date)}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    🧙{' '}
                    {session.pc_ids
                      .map((pcId) => pcs.find((pc) => pc.id === pcId))
                      .filter((pc): pc is typeof pcs[0] => Boolean(pc))
                      .map((pc) => `${pc.name}${pc.player_name ? ` (${pc.player_name})` : ''}`)
                      .join(', ') || 'Нет персонажей'}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Player Characters List */}
      {pcs.length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
          <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
            <span>🧙</span> Персонажи игроков (первые 5)
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {pcs
              .slice(-5)
              .reverse()
              .map((pc) => (
                <div key={pc.id} className="bg-slate-700/50 rounded p-3 border-l-2 border-blue-500">
                  <p className="font-medium text-slate-100 text-sm">{pc.name}</p>
                  {pc.player_name && (
                    <div className="text-xs text-slate-300 mt-1">
                      👤 Игрок: {pc.player_name}
                    </div>
                  )}
                  <div className="text-xs text-slate-300 mt-1">
                    {pc.class && <span>{pc.class}</span>}
                    {pc.level && <span> • Уровень {pc.level}</span>}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* NPCs List */}
      {npcs.length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
          <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
            <span>👹</span> НПС (первые 5)
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {npcs
              .slice(-5)
              .reverse()
              .map((npc) => (
                <div key={npc.id} className="bg-slate-700/50 rounded p-3 border-l-2 border-purple-500">
                  <p className="font-medium text-slate-100 text-sm">{npc.name}</p>
                  {npc.role && (
                    <div className="text-xs text-slate-300 mt-1">
                      👑 {npc.role}
                    </div>
                  )}
                  {npc.status && (
                    <div className="text-xs text-slate-300 mt-1">
                      ⚔️ Статус: {npc.status}
                    </div>
                  )}
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

    {/* Telegram Broadcast Modal */}
    <TelegramBroadcastModal
      isOpen={showTelegramModal}
      onClose={() => setShowTelegramModal(false)}
      characters={pcs}
    />
  </div>
  );
}

export default Dashboard;
