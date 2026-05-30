import { useState, useRef, useEffect } from 'react';
import { SearchResult } from '../types';
import { useStore } from '../store';

interface SearchBarProps {
  onResultSelect: (result: SearchResult) => void;
}

export function SearchBar({ onResultSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { searchEntities } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle search input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      const searchResults = searchEntities(value);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  // Handle result selection
  const handleSelectResult = (result: SearchResult) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onResultSelect(result);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon and color based on type
  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'pc':
        return '🧙';
      case 'npc':
        return '👤';
      case 'twist':
        return '✨';
      case 'session':
        return '📅';
      case 'locations':
        return '📍';
      default:
        return '📌';
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'pc':
        return 'text-blue-400';
      case 'npc':
        return 'text-purple-400';
      case 'twist':
        return 'text-amber-400';
      case 'session':
        return 'text-cyan-400';
      case 'locations':
        return 'text-emerald-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Поиск имён, ролей, типов..."
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600"
          onFocus={() => query && setIsOpen(true)}
        />
        <span className="absolute right-3 top-2.5 text-slate-500">🔍</span>
      </div>

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelectResult(result)}
              className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-b-0 flex items-start gap-3"
            >
              <span className="text-lg flex-shrink-0">{getTypeIcon(result.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{result.name}</div>
                {result.description && (
                  <div className={`text-xs ${getTypeColor(result.type)} truncate`}>
                    {result.description}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          <div className="px-4 py-6 text-center">
            <p className="text-slate-400 text-sm">Ничего не найдено для &quot;{query}&quot;</p>
            <p className="text-slate-500 text-xs mt-2">Попробуйте поискать по имени, роли или типу</p>
          </div>
        </div>
      )}
    </div>
  );
}
