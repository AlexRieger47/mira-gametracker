import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import miraLogo from '/iconmiraki.svg'
import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Sección principal */}
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={miraLogo} alt="Mira GameTracker" width={40} height={40} />
              <span>Mira GameTracker</span>
            </div>
            <p className="footer-description">
              Tu biblioteca personal de videojuegos. Organiza, reseña y explora
              tu colección gaming de manera inteligente.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4>Navegación</h4>
              <ul>
                <li><a href="/">Biblioteca</a></li>
                <li><a href="/agregar-juego">Agregar Juego</a></li>
                <li><a href="/resenas">Reseñas</a></li>
                <li><a href="/estadisticas">Estadísticas</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Características</h4>
              <ul>
                <li>Gestión de Biblioteca</li>
                <li>Sistema de Reseñas</li>
                <li>Estadísticas Personales</li>
                <li>Filtros Avanzados</li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Tecnologías</h4>
              <ul>
                <li>React + Vite</li>
                <li>Node.js + Express</li>
                <li>MongoDB + Mongoose</li>
                <li>CSS</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="footer-divider"></div>

        {/* Sección Inferior */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} Mira GameTracker. Todos los derechos reservados.
          </p>
          <div className="footer-social">
            <a
              href="https://github.com/alexander-david-molina-rieger"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub">
              <FaGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/skakterx/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a
              href="mailto:alexrieger.147@gmail.com"
              aria-label="Envíame un correo">
              <FaEnvelope />
            </a>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="footer-info">
          <p className="footer-note">
            Mira GameTracker es un proyecto de demostración que muestra las capacidades
            de desarrollo full-stack de Alexander Rieger con tecnologías modernas.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer