# DM Tracker — Архитектура Layout

## 📁 Структура файлов

```
src/
├── components/
│   └── Layout.tsx        # Главный компонент с навигацией (header + sidebar/tab-bar + content)
├── pages/
│   ├── Dashboard.tsx     # 📊 Главная страница со статистикой
│   ├── Characters.tsx    # 🧙 Список персонажей (НПС и ПС)
│   ├── Twists.tsx        # ✨ Список твистов
│   └── Sessions.tsx      # 📅 Список сессий
├── store.ts              # Zustand store с логикой данных и localStorage
├── types.ts              # TypeScript типы для всех сущностей
├── App.tsx               # Root компонент приложения
├── main.tsx              # Точка входа React
└── index.css             # Глобальные стили Tailwind
```

## 🎨 Дизайн Layout

### Desktop (≥768px)
- **Header** (фиксированный сверху)
  - Левая часть: название приложения + логотип
  - Центр: поле поиска (пока заглушка)
  - Правая часть: (место для будущих кнопок)

- **Боковое меню** (левая часть)
  - 4 пункта навигации: Dashboard, Персонажи, Твисты, Сессии
  - Активный пункт подсвечивается `bg-slate-700`
  - Наводка: `hover:bg-slate-800`

- **Контент** (основная область)
  - Скролляемая область с `overflow-auto`
  - Padding 6 на desktop, 4 на мобильном

### Mobile (<768px)
- **Header** (фиксированный сверху)
  - Левая часть: название приложения
  - Правая часть: кнопка меню (☰/✕)

- **Mobile Menu** (dropdown из header)
  - Появляется при нажатии кнопки меню
  - Перекрывает контент (overlay)
  - Закрывается при выборе пункта

- **Bottom Tab Bar** (фиксированный снизу)
  - 4 таба с иконками и названиями
  - Активный таб: `text-blue-400 bg-slate-800`
  - Неактивный: `text-slate-400`

## 🔄 Состояние и переключение экранов

```tsx
// В Layout.tsx используется простое локальное состояние:
const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard')

// Тип Screen:
type Screen = 'dashboard' | 'characters' | 'twists' | 'sessions '|' locations '

// Переключение:
<button onClick={() => setCurrentScreen('characters')}>
  Перейти на персонажей
</button>
```

✅ **Преимущества этого подхода:**
- Нет необходимости в React Router пока
- Просто и понятно
- Состояние в памяти (не сохраняется в localStorage)

## 📍 Куда добавлять компоненты

### Если нужен новый экран/страница
1. Создайте файл в `src/pages/NewPage.tsx`
2. Добавьте пункт в `navItems` в `Layout.tsx`
3. Добавьте case в `renderScreen()` функцию

**Пример:**
```tsx
// src/pages/Inventory.tsx
function Inventory() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">🎒 Инвентарь</h2>
      {/* Ваш контент */}
    </div>
  )
}
export default Inventory

// В Layout.tsx добавить:
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'inventory', label: 'Инвентарь', icon: '🎒' }, // ← новый пункт
  // ...
]

// И в renderScreen():
case 'inventory':
  return <Inventory />
```

### Если нужен компонент внутри страницы
Создавайте в `src/components/`:
- `CharacterCard.tsx` — карточка персонажа
- `TwistForm.tsx` — форма создания твиста
- `SessionsList.tsx` — список сессий
- и т.д.

Затем импортируйте в соответствующую страницу:
```tsx
// src/pages/Characters.tsx
import CharacterCard from '../components/CharacterCard'

function Characters() {
  return (
    <div>
      {characters.map(char => (
        <CharacterCard key={char.id} character={char} />
      ))}
    </div>
  )
}
```

### Если нужна форма
1. Создайте компонент в `src/components/Forms/FormName.tsx`
2. Используйте контролируемые компоненты с `useState`
3. При сохранении вызывайте методы из `useStore`:

```tsx
import { useStore } from '../store'

function AddCharacterForm() {
  const [name, setName] = useState('')
  const addNpc = useStore((state) => state.addNpc)

  const handleSubmit = () => {
    addNpc({ name })
    setName('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        placeholder="Имя НПС"
      />
      <button type="submit">Добавить</button>
    </form>
  )
}
```

## 🎨 Tailwind классы по умолчанию

**Цвета темной темы:**
- Фон приложения: `bg-slate-950` (почти чёрный #030712)
- Фон компонентов: `bg-slate-800` или `bg-slate-900`
- Текст: `text-slate-100` (почти белый)
- Вторичный текст: `text-slate-400`
- Границы: `border-slate-800` или `border-slate-700`
- Активное: `bg-blue-600`, `text-blue-400`

**Используемые при наведении:**
```tsx
className="hover:bg-slate-800 transition-colors"
```

**Спейсинг:**
- Между секциями: `space-y-6`
- Внутри контейнера: `gap-4`
- Padding контейнера: `p-6` или `px-4 py-2`

## 🚀 Установка зависимостей и запуск

```bash
npm install
npm run dev          # Запуск dev сервера
npm run build        # Сборка для production
```

## 📌 Примечания

- **Dark Mode**: Уже активирована в `tailwind.config.js` через `darkMode: 'class'`
- **localStorage**: Автоматически сохраняет/загружает данные (см. `App.tsx` и `store.ts`)
- **Icons**: Используются простые emoji (🧙, 📊, ✨, 📅) для минимизма
- **Поиск**: На header — заглушка (disabled), реализуется позже в компоненте поиска
