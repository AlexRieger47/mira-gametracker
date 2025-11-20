import './App.css'

function App() {
  // Variables para mi Carta de Presentación

  const nombre = "Alexander Rieger";
  const edad = 25;
  const titulo = "Desarrollador Full Stack";
  const ubicacion = "Algorta, Uruguay";
  const disponibilidad = false;
  const email = "alexrieger.147@gmail.com";
  const telefono = "+59899050760";

  // Clases para el Contenedor Principal
  const claseContenedor = "tarjeta-contenedor";
  const claseHeader = "tarjeta-header";
  const claseInfo = "tarjeta-info";
  const claseItem = "info-item";
  const claseDisponibilidad = "disponibilidad activo";
  return (
    <div className="app-background">
      <div className={claseContenedor}>
        <div className={claseHeader}>
          <h2>{nombre}</h2>
          <p>{titulo}</p>
        </div>

        {/* Información Personal */}
        <div className={claseInfo}>
          <div className={claseItem}>
            <span className="icono">📍</span>
            <div className="item-contenido">
              <span className="label">Ubicación</span>
              <span className="valor">{ubicacion}</span>
            </div>
          </div>

          <div className={claseItem}>
            <span className="icono">🎂</span>
            <div className="item-contenido">
              <span className="label">Edad</span>
              <span className="valor">{edad} años</span>
            </div>
          </div>

          <div className={claseItem}>
            <span className="icono">📧</span>
            <div className="item-contenido">
              <span className="label">Email</span>
              <span className="valor">{email}</span>
            </div>
          </div>

          <div className={claseItem}>
            <span className="icono">📱</span>
            <div className="item-contenido">
              <span className="label">Teléfono</span>
              <span className="valor">{telefono}</span>
            </div>
          </div>
        </div>

        <div className={claseDisponibilidad}>
          <span className="status-dot"></span>
          <span>{disponibilidad}</span>
        </div>
      </div>
    </div>
  );
}

export default App