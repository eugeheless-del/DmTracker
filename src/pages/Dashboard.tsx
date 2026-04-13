function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">📊 Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Placeholder cards for stats */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Персонажей</div>
          <div className="text-3xl font-bold">0</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Твистов</div>
          <div className="text-3xl font-bold">0</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Сессий</div>
          <div className="text-3xl font-bold">0</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">НПС</div>
          <div className="text-3xl font-bold">0</div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center text-slate-400">
        <p className="mb-2">Большая часть функционала в разработке...</p>
        <p className="text-sm">Перейдите на другие вкладки, чтобы начать добавлять данные</p>
      </div>
    </div>
  )
}

export default Dashboard
