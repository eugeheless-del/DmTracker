import { useState } from 'react';
import { PC } from '../types';
import {
  generateBroadcastReport,
} from '../utils/telegram';

interface TelegramBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: PC[];
}

type SendingState = 'idle' | 'sending' | 'sent';

interface BroadcastResult {
  id: string;
  name: string;
  success: boolean;
  error?: string;
}

export function TelegramBroadcastModal({
  isOpen,
  onClose,
  characters,
}: TelegramBroadcastModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [templateMessage, setTemplateMessage] = useState('');
  const [personalizedMessages, setPersonalizedMessages] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingState, setSendingState] = useState<SendingState>('idle');
  const [progress, setProgress] = useState({ sent: 0, total: 0, current: '' });
  const [results, setResults] = useState<BroadcastResult[]>([]);

  // Filter characters by search term
  const filteredCharacters = characters.filter((char) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      char.name.toLowerCase().includes(searchLower) ||
      char.player_name?.toLowerCase().includes(searchLower)
    );
  });

  // Handle checkbox toggle
  const toggleCharacter = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Update personalized message for a character
  const updatePersonalizedMessage = (characterId: string, text: string) => {
    setPersonalizedMessages((prev) => ({
      ...prev,
      [characterId]: text,
    }));
  };

  // Apply template to all selected characters
  const applyTemplateToAll = () => {
    if (!templateMessage.trim()) return;
    const newMessages: Record<string, string> = {};
    selectedIds.forEach((id) => {
      newMessages[id] = templateMessage;
    });
    setPersonalizedMessages((prev) => ({
      ...prev,
      ...newMessages,
    }));
  };

  // Select/deselect all
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCharacters.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCharacters.map((c) => c.id)));
    }
  };

  // Send to selected with personalized messages
  const handleSendSelected = async () => {
    if (selectedIds.size === 0) return;

    const recipientsIds = Array.from(selectedIds);
    const recipients = characters
      .filter((c) => recipientsIds.includes(c.id) && c.telegram_chat_id)
      .map((c) => ({
        id: c.id,
        chatId: c.telegram_chat_id,
        name: c.name,
        message: personalizedMessages[c.id] || '',
      }))
      .filter((r) => r.message.trim());

    if (recipients.length === 0) {
      alert('Выберите персонажей и введите сообщения');
      return;
    }

    await performBroadcastPersonalized(recipients);
  };

  // Send to all using template
  const handleSendAll = async () => {
    if (!templateMessage.trim()) return;

    const recipients = characters
      .filter((c) => c.telegram_chat_id)
      .map((c) => ({
        id: c.id,
        chatId: c.telegram_chat_id,
        name: c.name,
        message: templateMessage,
      }));

    if (recipients.length === 0) {
      alert('Нет персонажей с действительным Telegram chat ID');
      return;
    }

    await performBroadcastPersonalized(recipients);
  };

  // Perform personalized broadcast
  const performBroadcastPersonalized = async (
    recipients: Array<{ id: string; chatId: string; name: string; message: string }>
  ) => {
    setSendingState('sending');
    setResults([]);

    // Send each message individually
    const broadcastResults: BroadcastResult[] = [];
    let sent = 0;

    for (const recipient of recipients) {
      setProgress({ sent, total: recipients.length, current: recipient.name });
      
      try {
        // Import sendTelegramMessage from telegram utils
        const response = await fetch(
          `https://api.telegram.org/bot${import.meta.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: recipient.chatId,
              text: recipient.message,
              parse_mode: 'Markdown',
            }),
          }
        );

        if (response.ok) {
          broadcastResults.push({
            id: recipient.id,
            name: recipient.name,
            success: true,
          });
        } else {
          const error = await response.json();
          broadcastResults.push({
            id: recipient.id,
            name: recipient.name,
            success: false,
            error: error.description || 'Unknown error',
          });
        }
      } catch (error) {
        broadcastResults.push({
          id: recipient.id,
          name: recipient.name,
          success: false,
          error: error instanceof Error ? error.message : 'Network error',
        });
      }

      sent++;
    }

    setProgress({ sent: recipients.length, total: recipients.length, current: '' });
    setResults(broadcastResults);
    setSendingState('sent');
  };

  // Close modal and reset
  const handleClose = () => {
    setSelectedIds(new Set());
    setTemplateMessage('');
    setPersonalizedMessages({});
    setSearchTerm('');
    setSendingState('idle');
    setProgress({ sent: 0, total: 0, current: '' });
    setResults([]);
    onClose();
  };

  // Get report
  const report =
    results.length > 0
      ? generateBroadcastReport(results)
      : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📢</span> Рассылка в Telegram
          </h2>
          <button
            onClick={handleClose}
            disabled={sendingState === 'sending'}
            className="text-slate-400 hover:text-white disabled:opacity-50 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {sendingState === 'idle' && (
            <>
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  🔍 Поиск игроков
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Имя персонажа или игрока..."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Character Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-slate-300">
                    👥 Выбор персонажей ({selectedIds.size}/{filteredCharacters.length})
                  </label>
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
                  >
                    {selectedIds.size === filteredCharacters.length
                      ? 'Снять все'
                      : 'Выбрать все'}
                  </button>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded p-4 max-h-48 overflow-y-auto space-y-2">
                  {filteredCharacters.length === 0 ? (
                    <p className="text-slate-400 text-sm">Персонажей не найдено</p>
                  ) : (
                    filteredCharacters.map((char) => (
                      <label
                        key={char.id}
                        className="flex items-center gap-3 p-2 hover:bg-slate-700/50 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(char.id)}
                          onChange={() => toggleCharacter(char.id)}
                          disabled={!char.telegram_chat_id}
                          className="w-4 h-4 rounded border-slate-600 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {char.name}
                          </p>
                          {char.player_name && (
                            <p className="text-xs text-slate-400 truncate">
                              Игрок: {char.player_name}
                            </p>
                          )}
                        </div>
                        {!char.telegram_chat_id && (
                          <span className="text-xs text-orange-400">❌ Нет ID</span>
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Template Message */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  📝 Общий шаблон сообщения ({templateMessage.length} символов)
                </label>
                <textarea
                  value={templateMessage}
                  onChange={(e) => setTemplateMessage(e.target.value)}
                  placeholder="Введите текст шаблона для быстрой рассылки всем... Поддерживается Markdown: *жирный*, _курсив_, `код`"
                  maxLength={4096}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  rows={3}
                />
                <p className="text-xs text-slate-500 mt-2">
                  ℹ️ Используйте "Применить ко всем" для копирования в индивидуальные поля
                </p>
              </div>

              {/* Personalized Messages */}
              {selectedIds.size > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-300">
                      💬 Персонализированные сообщения
                    </label>
                    <button
                      onClick={applyTemplateToAll}
                      disabled={!templateMessage.trim()}
                      className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-200 rounded transition-colors"
                    >
                      📋 Применить ко всем
                    </button>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded p-4 space-y-4 max-h-96 overflow-y-auto">
                    {filteredCharacters
                      .filter((char) => selectedIds.has(char.id) && char.telegram_chat_id)
                      .map((char) => (
                        <div key={char.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-300">
                              {char.name}
                            </span>
                            {char.player_name && (
                              <span className="text-xs text-slate-500">
                                ({char.player_name})
                              </span>
                            )}
                            {personalizedMessages[char.id]?.length > 0 && (
                              <span className="text-xs text-green-400 ml-auto">
                                ✓ {personalizedMessages[char.id].length} символов
                              </span>
                            )}
                          </div>
                          <textarea
                            value={personalizedMessages[char.id] || ''}
                            onChange={(e) =>
                              updatePersonalizedMessage(char.id, e.target.value)
                            }
                            placeholder={`Сообщение для ${char.name}...`}
                            maxLength={4096}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm"
                            rows={3}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Template Preview */}
              {templateMessage.trim() && (
                <div className="bg-slate-800/50 border border-slate-700 rounded p-4">
                  <p className="text-xs font-medium text-slate-400 mb-2">
                    👁️ Предпросмотр шаблона:
                  </p>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">
                    {templateMessage}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSendSelected}
                  disabled={selectedIds.size === 0 || !Array.from(selectedIds).some(id => personalizedMessages[id]?.trim())}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded transition-colors"
                >
                  ✉️ Отправить выбранным ({selectedIds.size})
                </button>
                <button
                  onClick={handleSendAll}
                  disabled={!templateMessage.trim() || characters.filter(c => c.telegram_chat_id).length === 0}
                  className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded transition-colors"
                >
                  📢 Отправить ВСЕМ ({characters.filter(c => c.telegram_chat_id).length})
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded transition-colors"
                >
                  Отмена
                </button>
              </div>
            </>
          )}

          {sendingState === 'sending' && (
            <div className="space-y-4 py-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full mx-auto"></div>
              <p className="text-slate-300 font-medium">
                Отправлено {progress.sent} из {progress.total}...
              </p>
              <p className="text-sm text-slate-400">{progress.current}</p>
            </div>
          )}

          {sendingState === 'sent' && report && (
            <div className="space-y-4 py-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-900/30 border border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-300">✅ Успешно</p>
                  <p className="text-3xl font-bold text-green-400">{report.successful}</p>
                </div>
                <div className={`rounded-lg p-4 border ${
                  report.failed === 0
                    ? 'bg-slate-700/30 border-slate-600'
                    : 'bg-red-900/30 border-red-800'
                }`}>
                  <p className={`text-sm ${report.failed === 0 ? 'text-slate-300' : 'text-red-300'}`}>
                    ❌ Ошибок
                  </p>
                  <p className={`text-3xl font-bold ${report.failed === 0 ? 'text-slate-400' : 'text-red-400'}`}>
                    {report.failed}
                  </p>
                </div>
              </div>

              {/* Failed List */}
              {report.failedList.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded p-4">
                  <p className="text-sm font-medium text-slate-300 mb-3">
                    ⚠️ Не удалось отправить ({report.failedList.length}):
                  </p>
                  <ul className="space-y-1">
                    {report.failedList.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-400">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSendingState('idle');
                    setResults([]);
                    setPersonalizedMessages({});
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
                >
                  📤 Отправить ещё раз
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
