import { useState } from 'react';
import { useStore } from '../store';
import { formatDate } from '../utils/formatDate';
import { CharacterCard } from '../components/CharacterCard';
import { CharacterForm } from '../components/CharacterForm';
import InventoryModal from '../components/InventoryModal';
import { TelegramBroadcastModal } from '../components/TelegramBroadcastModal';
import { PC, NPC } from '../types';

type Tab = 'overview' | 'characters' | 'twists' | 'sessions';

function Dashboard() {
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'pc' | 'npc'>('pc');
  const [editingCharacter, setEditingCharacter] = useState<PC | NPC | undefined>();
  const [inventoryPc, setInventoryPc] = useState<PC | undefined>();
 
  const { pcs, npcs, twists, sessions, updatePc, updateNpc, deletePc, deleteNpc } = useStore();
  if (!pcs || !npcs || !twists || !sessions) {
    return <div>Загрузка данных...</div>;
  }
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('dm_tracker_quick_notes');
    return saved || '';
  });

  // Save notes to localStorage
  const handleNotesChange = (value: string) => {
    setNotes(value);
    localStorage.setItem('dm_tracker_quick_notes', value);
  };

  const handleEditCharacter = (character: PC | NPC, type: 'pc' | 'npc') => {
    setEditingCharacter(character);
    setFormType(type);
    setShowForm(true);
  };

  const handleDeleteCharacter = async (character: PC | NPC, type: 'pc' | 'npc') => {
    if (!window.confirm(`Удалить персонажа "${character.name}"?`)) return;
    try {
      if (type === 'pc') {
        await deletePc(character.id);
      } else {
        await deleteNpc(character.id);
      }
    } catch (error) {
      alert('Ошибка при удалении персонажа. Попробуйте снова.');
      console.warn('Failed to delete character:', error);
    }
  };

  const handleInventoryOpen = (pc: PC) => {
    setInventoryPc(pc);
  };

  const handleInventoryClose = () => {
    setInventoryPc(undefined);
  };

  const handleCharacterSubmit = async (data: any) => {
    if (!editingCharacter) return;

    try {
      if (formType === 'pc') {
        await updatePc(editingCharacter.id, data);
      } else {
        await updateNpc(editingCharacter.id, data);
      }
      setShowForm(false);
      setEditingCharacter(undefined);
    } catch (error) {
      alert('Ошибка при сохранении персонажа. Попробуйте снова.');
      console.warn('Failed to submit character:', error);
    }
  };

  // Count active twists (not completed)
  const activeTwists = twists.filter((t) => t.status !== 'completed');

  return (
    <div style={{ 
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      minHeight: '100vh',
      gap: 'var(--space-lg)',
    }}>
      {/* Header with Tabs */}
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: 'var(--space-lg)',
          paddingTop: 'var(--space-lg)',
          paddingBottom: 'var(--space-lg)',
        }}>
          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            gridColumn: '1 / -1',
            justifyContent: 'center',
          }}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`btn ${activeTab === 'overview' ? 'btn--primary' : 'btn--ghost'}`}
            >
              📊 Общее
            </button>
            <button
              onClick={() => setActiveTab('characters')}
              className={`btn ${activeTab === 'characters' ? 'btn--primary' : 'btn--ghost'}`}
            >
              🧙 Персонажи
            </button>
            <button
              onClick={() => setActiveTab('twists')}
              className={`btn ${activeTab === 'twists' ? 'btn--primary' : 'btn--ghost'}`}
            >
              ✨ Твисты
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`btn ${activeTab === 'sessions' ? 'btn--primary' : 'btn--ghost'}`}
            >
              📅 Сессии
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr 280px',
        gap: 'var(--space-lg)',
        alignItems: 'start',
      }}>
        {/* Left Column: Sessions & Twists */}
        <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
          {/* Recent Sessions */}
          {sessions.length > 0 && (
            <div className="card card--bordered space-y-3">
              <h3 className="h3 text-accent">📅 Последние сессии</h3>
              <div style={{ display: 'grid', gap: 'var(--space-sm)', maxHeight: '320px', overflowY: 'auto' }}>
                {sessions
                  .filter((s) => s.pc_ids && s.pc_ids.length > 0)
                  .slice(-5)
                  .reverse()
                  .map((session) => (
                    <div key={session.id} className="card bg-card rounded-lg p-2 border-l-2 border-accent">
                      <p className="font-medium text-white text-xs">{session.name}</p>
                      <div className="small text-muted">
                        {formatDate(session.date)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Active Twists */}
          {activeTwists.length > 0 && (
            <div className="card card--bordered space-y-3">
              <h3 className="h3 text-accent">✨ Активные твисты</h3>
              <div style={{ display: 'grid', gap: 'var(--space-sm)', maxHeight: '320px', overflowY: 'auto' }}>
                {activeTwists.slice(-5).map((twist) => (
                  <div key={twist.id} className="card bg-card rounded-lg p-2 border-l-2 border-accent">
                    <p className="font-medium text-white text-xs">{twist.title}</p>
                    <div className="small text-muted">{twist.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center Column: Main Content */}
        <div className="card card--bordered p-6 min-h-96">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-md)',
              }}>
                <div className="card card--bordered">
                  <div className="label mb-2">🧙 Персонажей игроков</div>
                  <div className="h3 text-primary">{pcs.length}</div>
                  <p className="small text-muted mt-2">Игроков в команде</p>
                </div>
                <div className="card card--bordered">
                  <div className="label mb-2">👹 НПС</div>
                  <div className="h3 text-purple">{npcs.length}</div>
                  <p className="small text-muted mt-2">Персонажей мира</p>
                </div>
                <div className="card card--bordered">
                  <div className="label mb-2">✨ Активные твисты</div>
                  <div className="h3 text-accent">{activeTwists.length}</div>
                  <p className="small text-muted mt-2">из {twists.length} всего</p>
                </div>
              </div>
            </div>
          )}

          {/* Characters Tab */}
          {activeTab === 'characters' && (
            <div>
              {pcs.length > 0 && (
                <>
                  <h4 className="h3 text-primary mb-3">ПЛ (Персонажи Игроков)</h4>
                  <div className="char-grid-wrapper">
                    <div className="grid-container" style={{ marginBottom: 32 }}>
                      {pcs.map((pc) => (
                        <CharacterCard
                          key={pc.id}
                          character={pc}
                          type="pc"
                          onEdit={() => handleEditCharacter(pc, 'pc')}
                          onDelete={() => handleDeleteCharacter(pc, 'pc')}
                          onInventory={handleInventoryOpen}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
              {npcs.length > 0 && (
                <>
                  <h4 className="h3 text-purple mb-3">НПЛ (Персонажи без Игроков)</h4>
                  <div className="char-grid-wrapper">
                    <div className="grid-container">
                      {npcs.map((npc) => (
                        <CharacterCard
                          key={npc.id}
                          character={npc}
                          type="npc"
                          onEdit={() => handleEditCharacter(npc, 'npc')}
                          onDelete={() => handleDeleteCharacter(npc, 'npc')}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Twists Tab */}
          {activeTab === 'twists' && (
            <div style={{ display: 'grid', gap: 'var(--space-lg)', maxHeight: '600px', overflowY: 'auto' }}>
              {twists.length === 0 ? (
                <div className="text-center p-8">
                  <p className="h3 text-muted mb-2">Пока нет твистов</p>
                  <p className="small text-muted">Перейдите на страницу "Твисты" чтобы добавить</p>
                </div>
              ) : (
                twists.map((twist) => (
                  <div key={twist.id} className="card bg-card rounded-lg p-3 border-l-2 border-accent">
                    <p className="font-medium text-white text-sm">{twist.title}</p>
                    <div className="small text-muted mt-1">
                      {twist.description && <p>{twist.description}</p>}
                      <p>Статус: {twist.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div style={{ display: 'grid', gap: 'var(--space-lg)', maxHeight: '600px', overflowY: 'auto' }}>
              {sessions.length === 0 ? (
                <div className="text-center p-8">
                  <p className="h3 text-muted mb-2">Пока нет сессий</p>
                  <p className="small text-muted">Перейдите на страницу "Сессии" чтобы создать</p>
                </div>
              ) : (
                sessions
                  .slice()
                  .reverse()
                  .map((session) => (
                    <div key={session.id} className="card bg-card rounded-lg p-3 border-l-2 border-accent">
                      <p className="font-medium text-white text-sm">{session.name}</p>
                      <div className="small text-muted mt-1">
                        📅 {formatDate(session.date)}
                      </div>
                      {session.description && (
                        <p className="small text-muted mt-1">{session.description}</p>
                      )}
                      {session.pc_ids && session.pc_ids.length > 0 && (
                        <div className="small text-muted mt-1">
                          🧙 {session.pc_ids
                            .map((pcId) => pcs.find((pc) => pc.id === pcId))
                            .filter((pc): pc is typeof pcs[0] => Boolean(pc))
                            .map((pc) => pc.name)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          )}
        </div>

        {/* Right Column: Notes */}
        <div className="card card--bordered flex-col space-y-3">
          <h3 className="h3 text-accent">📝 Заметки</h3>
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Напишите что угодно: идеи, важные события, информацию о врагах..."
            className="textarea font-mono resize-none"
            style={{ minHeight: '400px', maxHeight: '400px', overflowY: 'auto' }}
          />
          <p className="small text-muted text-center">💾 Автосохранение</p>
        </div>
      </div>

      {/* Footer: Quick Input + Telegram Button */}
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 'var(--space-md)',
        paddingBottom: 'var(--space-lg)',
      }}>
        <div className="card card--bordered p-3" style={{ cursor: 'pointer' }}>
          <p className="small text-muted">Быстрые заметки</p>
        </div>
        <button
          onClick={() => setShowTelegramModal(true)}
          className="btn btn--accent"
          style={{ minWidth: '60px', minHeight: '50px' }}
        >
          📢
        </button>
      </div>

      {showForm && editingCharacter && (
        <CharacterForm
          type={formType}
          character={editingCharacter}
          onSubmit={handleCharacterSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingCharacter(undefined);
          }}
        />
      )}

      {inventoryPc && (
        <InventoryModal
          pc={inventoryPc}
          onClose={handleInventoryClose}
        />
      )}

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
