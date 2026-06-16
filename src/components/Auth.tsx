import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../supabaseClient'

function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignIn = mode === 'signin'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setError(error.message)
        } else {
          setMessage('Успешный вход. Загружаем приложение...')
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) {
          setError(error.message)
        } else {
          setMessage('Регистрация успешна. Проверьте почту для подтверждения.')
        }
      }
    } catch (unexpected) {
      setError('Неизвестная ошибка. Попробуйте снова.')
      console.error('Auth error:', unexpected)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/40">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Supabase Auth</p>
          <h1 className="text-3xl font-semibold">{isSignIn ? 'Вход в DM Tracker' : 'Регистрация'}</h1>
          <p className="text-slate-400">Используйте email и пароль для доступа к вашему трекеру.</p>
        </div>

        <div className="flex gap-2 rounded-full bg-slate-950/80 p-1 text-sm shadow-inner shadow-slate-900">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 rounded-full px-4 py-2 transition ${isSignIn ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-100'}`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-full px-4 py-2 transition ${!isSignIn ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-100'}`}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-blue-500"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Пароль
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-blue-500"
            />
          </label>

          {error && <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
          {message && <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-blue-600"
          >
            {loading ? 'Подождите...' : isSignIn ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          {isSignIn ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(isSignIn ? 'signup' : 'signin')
              setError(null)
              setMessage(null)
            }}
            className="font-semibold text-slate-100 hover:text-white"
          >
            {isSignIn ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Auth
