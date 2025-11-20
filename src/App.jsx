import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import miraLogo from '/iconmiraki.svg'
import { Toaster } from 'react-hot-toast'
import { GameProvider } from './context/GameContext'
import { ThemeProvider } from './context/ThemeContext'
import NavBar from './components/layout/NavBar'
import BibliotecaJuegos from './components/games/BibliotecaJuegos'
import FormularioJuego from './components/forms/FormularioJuego'
import FormularioReseña from './components/forms/FormularioReseña'
import ListaReseñas from './components/reviews/ListaReseñas'
import EstadisticasPersonales from './components/stats/EstadisticasPersonales'
import DetalleJuego from './components/games/DetalleJuego'
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
              {/* Alias para rutas históricas/usadas en componentes */}
              <Route path="/editar/juego/:id" element={<FormularioJuego />} />
              <Route path="/juegos/editar/:id" element={<FormularioJuego />} />
              <Route path="/juego/:id" element={<DetalleJuego />} />
              <Route path="/resenas" element={<ListaReseñas />} />
              <Route path="/agregar-resena/:juegoId?" element={<FormularioReseña />} />
              <Route path="/editar-resena/:id" element={<FormularioReseña />} />
              {/* Aliases con 'ñ' para compatibilidad y enlaces legados */}
              <Route path="/reseñas" element={<ListaReseñas />} />
              <Route path="/reseñas/nueva" element={<FormularioReseña />} />
              <Route path="/reseñas/editar/:id" element={<FormularioReseña />} />
              <Route path="/estadisticas" element={<EstadisticasPersonales />} />
              <Route path="*" element={
                <div className="not-found">
                  <div className="container">
                    <div className="not-found-content">
                      <h1>404</h1>
                      <h2>Página no encontrada</h2>
                      <p>La página que buscas no existe en tu biblioteca.</p>
                      <a href="/" className="btn btn-primary">
                        Volver a la biblioteca
                      </a>
                    </div>
                  </div>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </GameProvider>
    </>
  )
}

export default App
