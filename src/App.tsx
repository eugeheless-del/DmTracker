import { useEffect } from 'react'
import Layout from './components/Layout'
import { useStore } from './store'
import { useStatusNotifications } from './utils/useStatusNotifications'

function App() {
  useEffect(() => {
    useStore.getState().loadFromSupabase()
  }, [])

  // Включаем фоновую систему уведомлений
  useStatusNotifications()

  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10) + '...');

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <Layout />
    </div>
  )
  
}

export default App