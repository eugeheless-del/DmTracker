import { useState } from 'react'
import Dashboard from '../pages/Dashboard'
import Characters from '../pages/Characters'
import Twists from '../pages/Twists'
import Sessions from '../pages/Sessions'

type Screen = 'dashboard' | 'characters' | 'twists' | 'sessions'

function Layout() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'characters', label: 'Персонажи', icon: '🧙' },
    { id: 'twists', label: 'Твисты', icon: '✨' },
    { id: 'sessions', label: 'Сессии', icon: '📅' },
  ] as const

  // Handle navigation to characters with optional selected character
  const handleNavigateToCharacter = () => {
    setCurrentScreen('characters')
    setMobileMenuOpen(false)
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard />
      case 'characters':
        return <Characters />
      case 'twists':
        return <Twists onNavigateToCharacter={handleNavigateToCharacter} />
      case 'sessions':
        return <Sessions />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-2xl font-bold">🐉 DM Tracker</h1>
          </div>

          {/* Search bar (placeholder) */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Поиск..."
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-slate-600"
                disabled
              />
              <span className="absolute right-3 top-2.5 text-slate-500">🔍</span>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors text-xl"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col w-64 bg-slate-900 border-r border-slate-800">
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentScreen(item.id as Screen)
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-3 ${
                  currentScreen === item.id
                    ? 'bg-slate-700 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Navigation Menu (overlay) */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-slate-900 border-b border-slate-800 md:hidden">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentScreen(item.id as Screen)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-3 ${
                    currentScreen === item.id
                      ? 'bg-slate-700 text-white'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            {renderScreen()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden bg-slate-900 border-t border-slate-800 flex">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentScreen(item.id as Screen)
              setMobileMenuOpen(false)
            }}
            className={`flex-1 py-3 px-2 text-center transition-colors flex flex-col items-center gap-1 text-xs font-medium ${
              currentScreen === item.id
                ? 'text-blue-400 bg-slate-800'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default Layout
