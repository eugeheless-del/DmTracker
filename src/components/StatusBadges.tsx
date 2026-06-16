import { StatusEffect } from '../types';

interface StatusBadgesProps {
  statuses?: StatusEffect[];
  maxVisible?: number;
}

/**
 * Display status effect icons with tooltips
 * Shows compact status badges with hover tooltips
 * - Each status gets a colored badge with icon
 * - Tooltip shows name and description on hover
 * - Badges wrap if space is limited
 */
export function StatusBadges({ statuses = [], maxVisible = 5 }: StatusBadgesProps) {
  if (statuses.length === 0) return null;

  // Get unique color for each status based on its name
  const getStatusColor = (index: number): string => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-cyan-500',
    ];
    return colors[index % colors.length];
  };

  // Get emoji icon for status (simple mapping)
  const getStatusIcon = (name: string): string => {
    const nameLower = name.toLowerCase();
    
    // Common status mappings
    if (nameLower.includes('яд') || nameLower.includes('poison')) return '☠️';
    if (nameLower.includes('слеп') || nameLower.includes('blind')) return '🚫';
    if (nameLower.includes('парал') || nameLower.includes('paralyze')) return '🔒';
    if (nameLower.includes('огонь') || nameLower.includes('fire')) return '🔥';
    if (nameLower.includes('лёд') || nameLower.includes('cold')) return '❄️';
    if (nameLower.includes('боль') || nameLower.includes('pain')) return '💔';
    if (nameLower.includes('защит') || nameLower.includes('shield')) return '🛡️';
    if (nameLower.includes('благо') || nameLower.includes('bless')) return '✨';
    if (nameLower.includes('проклят') || nameLower.includes('curse')) return '👿';
    if (nameLower.includes('оглушен') || nameLower.includes('stun')) return '⭐';
    if (nameLower.includes('кровотеч') || nameLower.includes('bleed')) return '🩸';
    if (nameLower.includes('усилен') || nameLower.includes('buff')) return '💪';
    if (nameLower.includes('ослаблен') || nameLower.includes('weak')) return '📉';
    if (nameLower.includes('регенер') || nameLower.includes('regen')) return '🌿';
    if (nameLower.includes('невидим') || nameLower.includes('invisible')) return '👻';
    if (nameLower.includes('полёт') || nameLower.includes('fly')) return '🪶';
    if (nameLower.includes('ускорен') || nameLower.includes('haste')) return '⚡';
    if (nameLower.includes('сонный') || nameLower.includes('sleep')) return '😴';
    
    // Default icon
    return '✨';
  };

  const visibleStatuses = statuses.slice(0, maxVisible);
  const hiddenCount = Math.max(0, statuses.length - maxVisible);

  return (
    <div className="status-badges flex flex-wrap gap-1.5 items-center">
      {visibleStatuses.map((status, index) => (
        <div key={status.id} className="relative group">
          {/* Status Badge */}
          <div className={`${getStatusColor(index)} rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white cursor-help hover:scale-110 transition-transform duration-200 shadow-md`}>
            {getStatusIcon(status.name)}
          </div>

          {/* Tooltip - ONLY ONE */}
          <div className="tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
            <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-700 whitespace-nowrap">
              <p className="font-bold">{status.name}</p>
              {status.description && (
                <p className="text-slate-300 text-xs mt-1 max-w-xs break-words">
                  {status.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Show counter for hidden statuses */}
      {hiddenCount > 0 && (
        <div className="relative group">
          <div className="bg-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white cursor-help hover:scale-110 transition-transform duration-200 shadow-md">
            +{hiddenCount}
          </div>
          <div className="tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
            <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-700">
              +{hiddenCount} ещё статусов
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
