import { useState } from 'react';
import { Twist } from '../types';

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

  // Get twist type label
  const getTwistTypeLabel = (type?: string): string => {
    return twistTypeLabels[type || ''] || type || 'Неизвестный тип';
  };

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
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 hover:border-slate-600 transition-all duration-300 overflow-hidden">
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
