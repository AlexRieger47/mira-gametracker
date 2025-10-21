import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Toaster } from 'react-hot-toast'
import { GameProvider } from './context/GameContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/layout/Navbar'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    //Acá simulamos una carga inicial
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner-large"></div>
          <h2>Cargando Mira GameTracker...</h2>
          <p>Preparando tu biblioteca personal de videojuegos</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <GameProvider>
        <div className="app">
          <Toaster position="top-right" />
          <Navbar />
        </div>
      </GameProvider>
    </>
  )
}

export default App
