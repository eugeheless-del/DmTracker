import { useEffect, useState } from 'react';
import { useStore } from '../store';
import type { NPCTwistConnection, Twist } from '../types';

interface TwistCardProps {
  twist: Twist;
  onStatusChange: (twistId: string, newStatus: Twist['status']) => void;
  onEdit: (twist: Twist) => void;
  onDelete: (twist: Twist) => void;
}

// Map twist types to Russian labels
const twistTypeLabels: Record<string, string> = {
  revelation: 'Откровение',
  enemy: 'Враг',
  opportunity: 'Возможность',
  obstacle: 'Препятствие',
  alliance: 'Союз',
};

export function TwistCard({
  twist,
  onStatusChange,
  onEdit,
  onDelete,
}: TwistCardProps) {
  const toggleCondition = useStore((state) => state.toggleCondition);
  const loadTwistConnections = useStore((state) => state.loadTwistConnections);
  const removeNPCTwistConnection = useStore((state) => state.removeNPCTwistConnection);
  const [isExpanded, setIsExpanded] = useState(false);
  const [connections, setConnections] = useState<NPCTwistConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const conditions = twist.conditions || [];
  const completedConditions = conditions.filter((condition) => condition.isMet).length;
  const isReady = Boolean(twist.isReady);
  const progressPercent = conditions.length ? Math.round((completedConditions / conditions.length) * 100) : 0;

  // Get status badge color
  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'hidden':
        return 'bg-slate-600 text-slate-100'; // Hidden - grey
      case 'ready':
        return 'bg-yellow-600 text-yellow-100'; // Ready - yellow
      case 'revealed':
        return 'bg-blue-600 text-blue-100'; // Revealed - blue
      case 'completed':
        return 'bg-green-600 text-green-100'; // Completed - green
      default:
        return 'bg-slate-500 text-slate-100';
    }
  };

  // Get status label
  const getStatusLabel = (status?: string): string => {
    switch (status) {
      case 'hidden':
        return 'Скрыт';
      case 'ready':
        return 'Готов';
      case 'revealed':
        return 'Раскрыт';
      case 'completed':
        return 'Завершён';
      default:
        return 'Без статуса';
    }
  };

  // Get twist type label
  const getTwistTypeLabel = (type?: string): string => {
    return twistTypeLabels[type || ''] || type || 'Неизвестный тип';
  };

  // Load twist connections from store
  useEffect(() => {
    const loadConnections = async () => {
      setLoadingConnections(true);
      try {
        const data = await loadTwistConnections(twist.id);
        setConnections(data);
      } catch (error) {
        console.warn('Failed to load twist connections:', error);
      } finally {
        setLoadingConnections(false);
      }
    };

    loadConnections();
  }, [twist.id, loadTwistConnections]);

  // Handle status change with notification
  const handleStatusChange = (newStatus: Twist['status']) => {
    onStatusChange(twist.id, newStatus);
    if (newStatus === 'revealed') {
      console.log(`🔥 Твист "${twist.title}" раскрыт!`);
      if (window.confirm(`✨ Твист "${twist.title}" раскрыт!`)) {
        // Just confirm for now
      }
    }
  };

  return (
    <div className={`bg-slate-800 rounded-lg shadow-lg border transition-all duration-300 overflow-hidden ${isReady ? 'border-red-500 bg-red-900/20 ring-2 ring-red-500 animate-pulse' : 'border-slate-700 hover:border-slate-600'}`}>
      {/* Collapsed view - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-lg font-bold text-white truncate">{twist.title}</h3>

            {/* Type badge */}
            {twist.type && (
              <p className="text-xs mt-1 inline-block px-2 py-1 bg-purple-600 text-purple-100 rounded">
                {getTwistTypeLabel(twist.type)}
              </p>
            )}

            {/* Trigger condition */}
            {twist.trigger_condition && (
              <p className="text-sm text-slate-400 mt-2 truncate">
                ⚡ Триггер: {twist.trigger_condition}
              </p>
            )}

            {isReady && (
              <p className="mt-2 text-sm font-semibold text-red-200">⚡ ГОТОВ К ЗАПУСКУ</p>
            )}

            {conditions.length > 0 && (
              <div className="mt-3 space-y-1">
                {conditions.slice(0, 3).map((condition) => (
                  <div
                    key={condition.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleCondition(twist.id, condition.id);
                    }}
                    role="button"
                    tabIndex={0}
                    className={`flex items-center justify-between rounded-md border px-2 py-1 transition-colors ${condition.isMet ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'} cursor-pointer`}
                  >
                    <span className="flex items-center gap-2 text-xs leading-none">
                      <span className="text-xs">{condition.isMet ? '✅' : '☐'}</span>
                      <span className="truncate">{condition.label}</span>
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{condition.type}</span>
                  </div>
                ))}
                {conditions.length > 3 && (
                  <p className="text-xs text-slate-500">+{conditions.length - 3} ещё</p>
                )}
              </div>
            )}
          </div>

          {/* Status badge */}
          <span
            className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${getStatusColor(
              twist.status
            )}`}
          >
            {getStatusLabel(twist.status)}
          </span>
        </div>
      </button>

      {/* Expanded view */}
      {isExpanded && (
        <div className="border-t border-slate-700 bg-slate-750 p-4 space-y-4">
          {/* Description */}
          {twist.description && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">ОПИСАНИЕ</p>
              <p className="text-sm text-slate-300">{twist.description}</p>
            </div>
          )}

          {/* Type */}
          {twist.type && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">ТИП</p>
              <p className="text-sm text-slate-300">{getTwistTypeLabel(twist.type)}</p>
            </div>
          )}

          {/* Trigger condition */}
          {twist.trigger_condition && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">ТРИГГЕР</p>
              <p className="text-sm text-slate-300">{twist.trigger_condition}</p>
            </div>
          )}

          {conditions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">УСЛОВИЯ</p>
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <button
                    key={condition.id}
                    type="button"
                    onClick={() => toggleCondition(twist.id, condition.id)}
                    className={`w-full flex items-center justify-between gap-3 rounded-md border px-3 py-3 text-left transition ${condition.isMet ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'} cursor-pointer`}
                  >
                    <div>
                      <p className="text-sm font-medium truncate">{condition.label}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-1">{condition.type}</p>
                    </div>
                    <span className="text-lg">{condition.isMet ? '✅' : '☐'}</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-slate-300">{completedConditions}/{conditions.length} условий выполнено</p>
            </div>
          )}

          {/* Consequence */}
          {twist.consequence && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">ПОСЛЕДСТВИЕ</p>
              <p className="text-sm text-slate-300">{twist.consequence}</p>
            </div>
          )}

          {/* Status change buttons */}
          <div className="pt-3 border-t border-slate-600">
            <p className="text-xs font-semibold text-slate-400 mb-2">СМЕНИТЬ СТАТУС</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStatusChange('hidden')}
                className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white text-xs font-medium rounded transition-colors"
              >
                Скрыт
              </button>
              <button
                onClick={() => handleStatusChange('ready')}
                className="px-3 py-2 bg-yellow-700 hover:bg-yellow-600 text-yellow-100 text-xs font-medium rounded transition-colors"
              >
                Готов
              </button>
              <button
                onClick={() => handleStatusChange('revealed')}
                className="px-3 py-2 bg-blue-700 hover:bg-blue-600 text-blue-100 text-xs font-medium rounded transition-colors"
              >
                Раскрыт
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                className="px-3 py-2 bg-green-700 hover:bg-green-600 text-green-100 text-xs font-medium rounded transition-colors"
              >
                Завершён
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
            <h3 className="text-lg text-blue-300 mb-3 flex items-center gap-2">
              <span>👥</span>
              Замешанные НПС ({connections.length})
            </h3>

            {loadingConnections ? (
              <p className="text-slate-400">Загрузка...</p>
            ) : connections.length === 0 ? (
              <p className="text-slate-500 italic">Нет связанных НПС</p>
            ) : (
              <div className="space-y-2">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-start justify-between bg-slate-900/50 p-3 rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">👤</span>
                      <div className="flex-1">
                        <div className="text-white font-medium text-base">
                          {connection.npc?.name}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          {connection.npc?.role && <span>{connection.npc.role}</span>}
                          {connection.npc?.location && (
                            <span className="mx-2">•</span>
                          )}
                          {connection.npc?.location && (
                            <span>📍 {connection.npc.location}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 rounded bg-emerald-900/30 text-emerald-300 border border-emerald-700/50">
                            {connection.connection_type === 'involved' && 'Участвует'}
                            {connection.connection_type === 'victim' && 'Жертва'}
                            {connection.connection_type === 'culprit' && 'Виновник'}
                            {connection.connection_type === 'witness' && 'Свидетель'}
                          </span>
                          {connection.description && (
                            <span className="text-xs text-slate-400">
                              {connection.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        await removeNPCTwistConnection(connection.id);
                        setConnections((prev) => prev.filter((c) => c.id !== connection.id));
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Удалить связь"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit and Delete buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(twist)}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
            >
              Редактировать
            </button>
            <button
              onClick={() => onDelete(twist)}
              className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded transition-colors"
            >
              Удалить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
