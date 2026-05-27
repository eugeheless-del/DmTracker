import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { StatusEffect } from '../types';

/**
 * Группировка статусов по имени статуса
 * Возвращает Map<statusName, Array<{pcName: string, description?: string}>>
 */
function groupStatusesByName(statuses: StatusEffect[], pcs: any[]): Map<string, Array<{ pcName: string; description?: string }>> {
  const grouped = new Map<string, Array<{ pcName: string; description?: string }>>();

  statuses.forEach(status => {
    if (!status.is_active) return; // Пропускаем неактивные статусы

    const pc = pcs.find(pc => pc.id === status.pc_id);
    if (!pc) return;

    const pcName = pc.name || 'Неизвестный персонаж';
    const statusName = status.name || 'Без названия';

    if (!grouped.has(statusName)) {
      grouped.set(statusName, []);
    }

    grouped.get(statusName)!.push({
      pcName,
      description: status.description,
    });
  });

  return grouped;
}

/**
 * Показывает браузерное уведомление с группированными статусами
 */
function showStatusNotification(groupedStatuses: Map<string, Array<{ pcName: string; description?: string }>>): void {
  if (groupedStatuses.size === 0) return;

  // Проверяем разрешение на уведомления
  if (Notification.permission !== 'granted') {
    console.warn('Разрешение на уведомления не получено');
    return;
  }

  let body = 'Активные статусы персонажей:\n\n';

  groupedStatuses.forEach((pcs, statusName) => {
    body += `🔸 ${statusName}:\n`;
    pcs.forEach(pc => {
      body += `  - ${pc.pcName}`;
      if (pc.description) {
        body += ` (${pc.description})`;
      }
      body += '\n';
    });
    body += '\n';
  });

  const notification = new Notification('DM Tracker - Статусы персонажей', {
    body: body.trim(),
    icon: '/favicon.ico', // Или другой иконка
    tag: 'dm-tracker-statuses', // Для группировки уведомлений
  });

  // Автоматически закрываем через 10 секунд
  setTimeout(() => {
    notification.close();
  }, 10000);
}

/**
 * Хук для фоновой системы уведомлений о статусах
 * Каждые 5 минут собирает активные статусы и показывает уведомление
 */
export function useStatusNotifications() {
  const { pcs } = useStore();
  const intervalRef = useRef<any | null>(null);

  useEffect(() => {
    // Функция для проверки и показа уведомлений
    const checkAndNotify = () => {
      console.log('Проверка активных статусов...');

      // Собираем все активные статусы от всех ПЛ
      const allActiveStatuses: StatusEffect[] = [];
      pcs.forEach(pc => {
        if (pc.statuses) {
          pc.statuses.forEach(status => {
            if (status.is_active !== false) { // По умолчанию true, если не указано
              allActiveStatuses.push(status);
            }
          });
        }
      });

      console.log(`Найдено ${allActiveStatuses.length} активных статусов`);

      // Группируем статусы
      const groupedStatuses = groupStatusesByName(allActiveStatuses, pcs);

      console.log('Группированные статусы:', groupedStatuses);

      // Показываем уведомление, если есть активные статусы
      if (groupedStatuses.size > 0) {
        showStatusNotification(groupedStatuses);
      } else {
        console.log('Нет активных статусов для уведомления');
      }
    };

    // Запрашиваем разрешение на уведомления при монтировании
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Разрешение на уведомления получено');
        }
      });
    }

    // Первый запуск через 5 минут
    const initialTimeout = setTimeout(() => {
      checkAndNotify();

      // Затем каждые 5 минут
      intervalRef.current = setInterval(checkAndNotify, 5 * 60 * 1000); // 300000 мс
    }, 5 * 60 * 1000); // 300000 мс

    // Очистка при размонтировании
    return () => {
      if (initialTimeout) clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pcs]); // Зависимость от pcs, чтобы пересчитывать при изменении данных
}