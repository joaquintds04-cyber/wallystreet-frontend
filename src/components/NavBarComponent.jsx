import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BASE_URL } from '../utils/constants'
import api from '../utils/api'

function NavBarComponent() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('user_id')
  const [usuario, setUsuario] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return 
    let isMounted = true
    const obtenerPerfil = async () => {
      try {
        const response = await api.get(`/users/${userId}`)
        if (isMounted) {
          setUsuario(response.data)
        }
      } catch (error) {
        if (isMounted) {
          setUsuario(null)
          console.error('Error al obtener perfil:', error)
        }
      }
    }

    obtenerPerfil()

    return () => {
      isMounted = false
    }
  }, [token])

  const handleLogout = async () => {
    try {
      await api.post('/logout')
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
        <span>Hola {usuario?.name || localStorage.getItem('user_name')} | Portfolio: ${usuario?.total_portfolio_value}</span>
      )}
      <Link to="/portfolio">Mi portfolio</Link>
      <Link to="/operaciones">Mis operaciones</Link>
      <Link to="/panel">Ver panel</Link>
      <Link to="/editar">Editar usuario</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  )
}

export default NavBarComponent