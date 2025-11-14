import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FaHome,
  FaPlus,
  FaStar,
  FaChartBar,
  FaBars,
  FaTimes,
  FaSun,
  FaMoon
} from 'react-icons/fa'
import miraLogo from '/iconmiraki.svg'
import './NavBar.css'
import { useTheme } from '../../context/ThemeContext'

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const ThemeIcon = theme === 'dark' ? FaSun : FaMoon
  const nextLabel = theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const navItems = [
    {
      path: '/',
      label: 'Biblioteca',
      icon: FaHome,
      description: 'Accede a tu colección de juegos'
    },
    {
      path: '/agregar-juego',
      label: 'Agregar juego',
      icon: FaPlus,
      description: 'Añade un nuevo juego a tu biblioteca'
    },
    {
      path: '/resenas',
      label: 'Reseñas',
      icon: FaStar,
      description: 'Ver y gestionar reseñas'
    },
    {
      path: '/estadisticas',
      label: 'Estadísticas',
      icon: FaChartBar,
      description: 'Dashboard de tu actividad gaming'
    }
  ]

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo y Título */}
        <Link to="/biblioteca" className="navbar-brand" onClick={closeMenu}>
          <img src={miraLogo} alt="Mira GameTracker" className="navbar-logo" width={50} height={50} />
          <span className="navbar-title">Mira GameTracker</span>
        </Link>

        {/* Navegación Desktop */}
        <div className="navbar-nav desktop-nav">
          {navItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                title={item.description}
              >
                <IconComponent className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Botón de tema (desktop y móvil) */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={nextLabel}
          title={nextLabel}
        >
          <ThemeIcon />
        </button>

        {/* Menú Hamburguesa para móviles */}
        <button
          className="mobile-menu-toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navegación en móviles */}
        <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-content">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                  title={item.description}
                  onClick={closeMenu}
                >
                  <IconComponent className="mobile-nav-icon" />
                  <div className="mobile-nav-text">
                    <span className="mobile-nav-label">{item.label}</span>
                    <span className="mobile-nav-description">{item.description}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Overlay para cerrar menú en móviles */}
        {isMenuOpen && (
          <div className="mobile-nav-overlay" onClick={closeMenu}></div>
        )}
      </div>
    </nav>
  )
}

export default NavBar
