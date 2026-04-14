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
   /</div>
     /* <div style={{ backgroundColor: 'red', color: 'white', padding: '20px' }}>
      <h1>ТЕСТ 123</h1>
      <p>Если видишь это — React работает!</p>
    </div> */
  )
}

export default App