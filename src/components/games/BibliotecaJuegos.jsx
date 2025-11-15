import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../../context/GameContext'
import TarjetaJuego from '../games/TarjetaJuego'
import {
  FaSearch,
  FaFilter,
  FaPlus,
  FaGamepad,
  FaBook,
  FaTh,
  FaList,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa'
import { FaFaceFrown } from 'react-icons/fa6'
import './BibliotecaJuegos.css'

const BibliotecaJuegos = () => {
  const {
    juegos,
    loading,
    error,
    cargarJuegos,
  } = useGame()

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortBy, setSortBy] = useState('fechaCreacion')
  const [sortOrder, setSortOrder] = useState('desc')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Cargar juegos al montar el componente
  useEffect(() => {
    cargarJuegos()
  }, [])

  const juegosList = Array.isArray(juegos) ? juegos : []

  // Opciones dinámicas para filtros (deducidas de la biblioteca)
  const generos = Array.from(new Set(
    juegosList.map(game => game.genero).filter(Boolean)
  )).sort()

  const plataformas = Array.from(new Set(
    juegosList.map(game => game.plataforma).filter(Boolean)
  )).sort()

  // Filtrar y ordenar juegos
  const filteredAndSortedGames = juegosList
    .filter(game => {
      const matchesSearch = game.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (game.desarrollador || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGenre = !selectedGenre || game.genero === selectedGenre
      const matchesPlatform = !selectedPlatform || game.plataforma === selectedPlatform
      const matchesStatus = !selectedStatus || (selectedStatus === 'completado' && game.completado) ||
        (selectedStatus === 'pendiente' && !game.completado)
      return matchesSearch && matchesGenre && matchesPlatform && matchesStatus
    })
    .sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'titulo':
          aValue = (a.titulo || '').toLowerCase()
          bValue = (b.titulo || '').toLowerCase()
          break
        case 'añoLanzamiento':
          aValue = a.añoLanzamiento
          bValue = b.añoLanzamiento
          break
        case 'fechaCreacion':
          aValue = new Date(a.fechaCreacion)
          bValue = new Date(b.fechaCreacion)
          break
        default:
          aValue = a[sortBy]
          bValue = b[sortBy]
      }
      if (aValue === bValue) return 0
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (bValue > aValue ? 1 : -1)
    })

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedGenre('')
    setSelectedPlatform('')
    setSelectedStatus('')
    setSortBy('fechaCreacion')
    setSortOrder('desc')
  }

  // Estadísticas rápidas
  const totalGames = juegosList.length
  const completedGames = juegosList.filter(game => game.completado).length
  const pendingGames = totalGames - completedGames

  if (loading) {
    return (
      <div className="biblioteca-loading">
        <div className="loading-spinner">
        </div>
        <p>Cargando tu biblioteca...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="biblioteca-error">
        <FaFaceFrown className="error-logo" />
        <p>Error al cargar tu biblioteca. Por favor, intenta de nuevo.</p>
        <p>{error}</p>
        <button onClick={cargarJuegos} className="btn btn-primary">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="biblioteca-juegos">
      {/* Header */}
      <div className="biblioteca-header">
        <div className="header-content">
          <h1>
            <FaBook className="header-icon" />
            Mi Biblioteca de Juegos
          </h1>
          <p className="header-description">
            Explora y gestiona tu colección personal de juegos.
          </p>
        </div>

        <Link to="/agregar-juego" className="btn btn-primary">
          <FaPlus />
          Agregar Juego
        </Link>
      </div>

      {/* Estadísticas rápidas */}
      <div className="biblioteca-stats">
        <div className="stat-card">
          <FaGamepad className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">{totalGames}</span>
            <span className="stat-label">Juegos en tu Biblioteca</span>
          </div>
        </div>
        <div className="stat-card">
          <FaCheckCircle className="stat-icon completed" />
          <div className="stat-content">
            <span className="stat-number">{completedGames}</span>
            <span className="stat-label">Juegos Completados</span>
          </div>
        </div>
        <div className="stat-card">
          <FaClock className="stat-icon pending" />
          <div className="stat-content">
            <span className="stat-number">{pendingGames}</span>
            <span className="stat-label">Juegos Pendientes</span>
          </div>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="biblioteca-controls">
        <div className="search-section">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por título o desarrollador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            Filtros
          </button>

          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FaTh />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FaList />
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label> Género: </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="">Todos los géneros</option>
                {generos.map(genero => (
                  <option key={genero} value={genero}>
                    {genero}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label> Plataforma: </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
              >
                <option value="">Todas las plataformas</option>
                {plataformas.map(plataforma => (
                  <option key={plataforma} value={plataforma}>
                    {plataforma}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label> Estado: </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="completado">Completados</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>

            <div className="filter-group">
              <label> Ordenar por: </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="fechaCreacion">Fecha de agregado</option>
                <option value="titulo">Título</option>
                <option value="añoLanzamiento">Año de lanzamiento</option>
              </select>
            </div>

            <div classname="filter-group">
              <button
                className={`sort-order-btn ${sortOrder === 'asc' ? 'active' : ''}`}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
              </button>
            </div>

            <button className="clear-filters-btn" onClick={clearFilters}>
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de juegos */}
      <div className="biblioteca-content">
        {filteredAndSortedGames.length === 0 ? (
          <div className="empty-state">
            <FaGamepad className="empty-icon" />
            <h3>No se encontraron juegos.</h3>
            <p>
              {juegosList.length === 0
                ? 'Aún no has agregado ningún juego a tu biblioteca.'
                : 'No se encontraron juegos que coincidan con los filtros aplicados.'}
            </p>
            {juegosList.length === 0 && (
              <Link to="/agregar-juego" className="btn btn-primary">
                <FaPlus />
                Agregar primer juego
              </Link>
            )}
          </div>
        ) : (
          <div className={`games-container ${viewMode}`}>
            {filteredAndSortedGames.map(game => (
              <TarjetaJuego
                key={game.id || game._id}
                game={game}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Información de resultados */}
      {
        filteredAndSortedGames.length === 0 && (
          <div className="results-info">
            <p>
              Mostrando {filteredAndSortedGames.length} de {totalGames} juegos
            </p>
          </div>
        )
      }
    </div >
  )
}

export default BibliotecaJuegos