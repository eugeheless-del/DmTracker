import { useEffect } from 'react'
import Layout from './components/Layout'
import { useStore } from './store'

function App() {
  useEffect(() => {
    useStore.getState().loadFromSupabase()
  }, [])

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <Layout />
    </div>
  )
}

export default App