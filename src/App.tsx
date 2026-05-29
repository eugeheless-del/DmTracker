import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import Auth from './components/Auth'
import Layout from './components/Layout'
import { supabase } from './supabaseClient'
import { useStore } from './store'
import { useStatusNotifications } from './utils/useStatusNotifications'

function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    }

    initAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, authSession) => {
      setSession(authSession)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session) {
      useStore.getState().loadFromSupabase()
    }
  }, [session])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  // Включаем фоновую систему уведомлений
  useStatusNotifications()

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {session === undefined ? (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-8 text-slate-200 shadow-2xl">
            Загрузка...
          </div>
        </div>
      ) : session ? (
        <Layout session={session} onSignOut={handleSignOut} />
      ) : (
        <Auth />
      )}
    </div>
  )
}

export default App