import { HOTKEYS } from '../config/hotkeys';

type HotkeysHelpProps = {
  isOpen: boolean;
  onClose: () => void;
};

const hotkeySections = [
  {
    title: 'Навигация',
    items: [
      { label: 'Общее', combo: HOTKEYS.navigation.dashboard },
      { label: 'Персонажи', combo: HOTKEYS.navigation.characters },
      { label: 'Твисты', combo: HOTKEYS.navigation.twists },
      { label: 'Сессии', combo: HOTKEYS.navigation.sessions },
      { label: 'Локации', combo: HOTKEYS.navigation.locations },
    ],
  },
  {
    title: 'Создание',
    items: [
      { label: 'Игрок (PC)', combo: HOTKEYS.create.pc },
      { label: 'НПС (NPC)', combo: HOTKEYS.create.npc },
      { label: 'Новый твист', combo: HOTKEYS.create.twist },
      { label: 'Новая сессия', combo: HOTKEYS.create.session },
    ],
  },
  {
    title: 'Действия',
    items: [
      { label: 'Редактировать первый доступный элемент', combo: HOTKEYS.actions.edit },
      { label: 'Фокус на поиск', combo: HOTKEYS.actions.search },
    ],
  },
  {
    title: 'Помощь',
    items: [{ label: 'Показать это окно', combo: HOTKEYS.help }],
  },
];

export default function HotkeysHelp({ isOpen, onClose }: HotkeysHelpProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold">Справка по хоткеям</h2>
            <p className="text-sm text-slate-400 mt-1">Используйте горячие клавиши, чтобы быстрее работать в приложении.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-700"
          >
            Закрыть
          </button>
        </div>

        <div className="grid gap-6">
          {hotkeySections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              <div className="grid gap-2">
                {section.items.map((item) => (
                  <div key={item.combo} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <span className="text-sm text-slate-200">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-50">{item.combo}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
