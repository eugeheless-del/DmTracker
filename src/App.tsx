import { useEffect } from 'react'
import Layout from './components/Layout'
import { useStore } from './store'

function App() {
  // Load data from localStorage on mount
  useEffect(() => {
    useStore.getState().loadFromStorage()
  }, [])

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <Layout />
    </div>
  )
}

export default App
