import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function NavBarComponent() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('user_id')
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    if (!token) return 

    const obtenerPerfil = async () => {
      try {
        const response = await axios.get(
          `http://localhost/trabajophp/src/public/users/${userId}`,
          { headers: { Authorization: token } }
        )
        setUsuario(response.data)
      } catch (error) {
        console.error('Error al obtener perfil:', error)
      }
    }

    obtenerPerfil()
  }, [token])

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost/trabajophp/src/public/logout',
        {},
        { headers: { Authorization: token } }
      )
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    navigate('/')
  }

  if (!token) {
    return (
      <nav className="navbar">
        <Link to="/">Inicio</Link>
        <Link to="/registro">Registro</Link>
        <Link to="/login">Login</Link>
      </nav>
    )
  }

  return (
    <nav className="navbar">
      <Link to="/">Inicio</Link>
      {usuario && (
        <span>Hola {usuario.name} | Portfolio: ${usuario.total_portfolio_value}</span>
      )}
      <Link to="/portfolio">Mi portfolio</Link>
      <Link to="/operaciones">Mis operaciones</Link>
      <Link to="/panel">Ver panel</Link>
      <Link to={`/editar/${userId}`}>Editar usuario</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  )
}

export default NavBarComponent