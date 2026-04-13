function Twists() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">✨ Твисты</h2>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
          + Новый твист
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center text-slate-400">
        <p className="text-lg mb-2">Пока нет твистов</p>
        <p className="text-sm">Нажмите кнопку выше, чтобы добавить первый</p>
      </div>

      {/* Placeholder: будущий список твистов */}
      <div className="text-xs text-slate-500 mt-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
        💡 Здесь появится список твистов с типами (revelation, enemy, opportunity, obstacle, alliance)
      </div>
    </div>
  )
}

export default Twists
