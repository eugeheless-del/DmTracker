import { useState } from 'react';
import { Twist } from '../types';

interface TwistCardProps {
  twist: Twist;
  onStatusChange: (twistId: string, newStatus: Twist['status']) => void;
  onEdit: (twist: Twist) => void;
  onDelete: (twist: Twist) => void;
}

export function TwistCard({ twist, onStatusChange, onEdit, onDelete }: TwistCardProps) {
  // State for expanded view
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Handle status change with toast notification for 'revealed'
  const handleStatusChange = (newStatus: Twist['status']) => {
    onStatusChange(twist.id, newStatus);
    if (newStatus === 'revealed') {
      // Toast notification (placeholder)
      console.log(`🔥 Твист "${twist.name}" раскрыт!`);
      // Show browser notification (can be replaced with proper toast library later)
      if (window.confirm(`✨ Твист "${twist.name}" раскрыт!`)) {
        // Just confirm for now
      }
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 hover:border-slate-600 transition-all duration-300 overflow-hidden">
      {/* Collapsed view - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-lg font-bold text-white truncate">{twist.name}</h3>
            
            {/* Trigger */}
            {twist.trigger && (
              <p className="text-sm text-slate-400 mt-1 truncate">
                ⚡ Триггер: {twist.trigger}
              </p>
            )}
            
            {/* IDs preview */}
            {(twist.npcIds?.length > 0 || twist.pcIds?.length > 0) && (
              <p className="text-xs text-slate-500 mt-1">
                {twist.npcIds?.length > 0 && `НПЛ: ${twist.npcIds.length}`}
                {twist.npcIds?.length > 0 && twist.pcIds?.length > 0 && ' • '}
                {twist.pcIds?.length > 0 && `ПЛ: ${twist.pcIds.length}`}
              </p>
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

          {/* Consequence */}
          {twist.consequence && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">ПОСЛЕДСТВИЕ</p>
              <p className="text-sm text-slate-300">{twist.consequence}</p>
            </div>
          )}

          {/* Type */}
          {twist.type && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">ТИП</p>
              <p className="text-sm text-slate-300">{twist.type}</p>
            </div>
          )}

          {/* Associated characters */}
          {(twist.npcIds?.length > 0 || twist.pcIds?.length > 0) && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">СВЯЗАННЫЕ</p>
              <div className="space-y-1">
                {twist.npcIds?.map((npcId) => (
                  <p key={npcId} className="text-sm text-slate-300">
                    → НПЛ: <span className="font-mono text-slate-400">{npcId}</span>
                  </p>
                ))}
                {twist.pcIds?.map((pcId) => (
                  <p key={pcId} className="text-sm text-slate-300">
                    → ПЛ: <span className="font-mono text-slate-400">{pcId}</span>
                  </p>
                ))}
              </div>
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
