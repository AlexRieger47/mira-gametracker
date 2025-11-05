import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import miraLogo from '/iconmiraki.svg'
import { Toaster } from 'react-hot-toast'
import { GameProvider } from './context/GameContext'
import { ThemeProvider } from './context/ThemeContext'
import NavBar from './components/layout/NavBar'
import BibliotecaJuegos from './components/games/BibliotecaJuegos'
import FormularioJuego from './components/forms/FormularioJuego'
import Footer from './components/layout/Footer'
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
          <NavBar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<BibliotecaJuegos />} />
              <Route path="/biblioteca" element={<BibliotecaJuegos />} />
              <Route path="/agregar-juego" element={<FormularioJuego />} />
              <Route path="/editar-juego/:id" element={<FormularioJuego />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </GameProvider>
    </>
  )
}

export default App
