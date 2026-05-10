// Telegram API constants
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const TELEGRAM_API_BASE = 'https://api.telegram.org';
const MESSAGE_DELAY = 150; // ms between messages to avoid rate limiting

/**
 * Send message to single Telegram chat
 * Returns success status and optional error message
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string,
  botToken?: string
): Promise<{ success: boolean; error?: string }> {
  if (!chatId || !text) {
    return { success: false, error: 'Invalid chat ID or message text' };
  }

  // Get bot token from environment or localStorage
  const token = botToken || localStorage.getItem('telegram_bot_token') || BOT_TOKEN;
  if (!token) {
    return { success: false, error: 'Telegram bot token not configured' };
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Detect specific error types
      if (errorData.description?.includes('blocked')) {
        return { success: false, error: 'Bot blocked by user' };
      }
      if (errorData.description?.includes('not found')) {
        return { success: false, error: 'Invalid chat ID' };
      }
      return { success: false, error: errorData.description || 'Failed to send message' };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { success: false, error: message };
  }
}

/**
 * Send broadcast to multiple recipients with progress tracking
 * Returns array of results for each recipient
 */
export async function sendTelegramBroadcast(
  recipients: Array<{ id: string; chatId: string; name: string }>,
  text: string,
  onProgress?: (sent: number, total: number, currentName: string) => void,
  botToken?: string
): Promise<
  Array<{
    id: string;
    name: string;
    success: boolean;
    error?: string;
  }>
> {
  const results = [];
  const total = recipients.length;

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    onProgress?.(i, total, recipient.name);

    const result = await sendTelegramMessage(recipient.chatId, text, botToken);
    results.push({
      id: recipient.id,
      name: recipient.name,
      ...result,
    });

    // Add delay between messages to avoid rate limiting
    if (i < recipients.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, MESSAGE_DELAY));
    }
  }

  onProgress?.(total, total, '');
  return results;
}

/**
 * Generate summary report from broadcast results
 */
export function generateBroadcastReport(
  results: Array<{ success: boolean; error?: string; name: string }>
): { successful: number; failed: number; failedList: string[] } {
  const failed = results.filter((r) => !r.success);
  return {
    successful: results.length - failed.length,
    failed: failed.length,
    failedList: failed.map((r) => `${r.name} (${r.error})`),
  };
}
